from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_FILE = "ngs_runs.xlsx"

class LibraryItem(BaseModel):
    s_no: int
    name: str
    samples: int
    reads: float
    remarks: Optional[str] = ""

class RunData(BaseModel):
    date: str
    run_id: str
    instrument: str
    flowcell: str
    seq_type: str
    loading_pattern: str
    libraries: List[LibraryItem]

def init_excel():
    if not os.path.exists(EXCEL_FILE):
        with pd.ExcelWriter(EXCEL_FILE, engine='openpyxl') as writer:
            pd.DataFrame(columns=["date", "run_id", "instrument", "flowcell", "seq_type", "loading_pattern"]).to_excel(writer, sheet_name='Runs', index=False)
            pd.DataFrame(columns=["run_id", "s_no", "name", "samples", "reads", "remarks"]).to_excel(writer, sheet_name='Libraries', index=False)

@app.on_event("startup")
async def startup_event():
    init_excel()

@app.get("/runs")
async def get_runs():
    if not os.path.exists(EXCEL_FILE):
        return []
    
    runs_df = pd.read_excel(EXCEL_FILE, sheet_name='Runs')
    libs_df = pd.read_excel(EXCEL_FILE, sheet_name='Libraries')
    
    result = []
    for _, run in runs_df.iterrows():
        run_id = run['run_id']
        run_libs = libs_df[libs_df['run_id'] == run_id].to_dict('records')
        
        # Format library keys for frontend
        formatted_libs = []
        for lib in run_libs:
            formatted_libs.append({
                "s_no": lib['s_no'],
                "name": lib['name'],
                "samples": lib['samples'],
                "reads": lib['reads'],
                "remarks": lib['remarks'] if pd.notna(lib['remarks']) else ""
            })
            
        result.append({
            "date": run['date'],
            "run_id": run['run_id'],
            "instrument": run['instrument'],
            "flowcell": run['flowcell'],
            "seq_type": run['seq_type'],
            "loading_pattern": run['loading_pattern'],
            "libraries": formatted_libs
        })
    return result

@app.post("/runs")
async def save_run(run_data: RunData):
    init_excel()
    
    # Read existing
    with pd.ExcelWriter(EXCEL_FILE, engine='openpyxl', mode='a', if_sheet_exists='overlay') as writer:
        try:
            runs_df = pd.read_excel(EXCEL_FILE, sheet_name='Runs')
            libs_df = pd.read_excel(EXCEL_FILE, sheet_name='Libraries')
        except:
            runs_df = pd.DataFrame(columns=["date", "run_id", "instrument", "flowcell", "seq_type", "loading_pattern"])
            libs_df = pd.DataFrame(columns=["run_id", "s_no", "name", "samples", "reads", "remarks"])

        # Check if run_id already exists
        if run_data.run_id in runs_df['run_id'].values:
             # Remove old data for this run_id
             runs_df = runs_df[runs_df['run_id'] != run_data.run_id]
             libs_df = libs_df[libs_df['run_id'] != run_data.run_id]

        # Add new run
        new_run = pd.DataFrame([{
            "date": run_data.date,
            "run_id": run_data.run_id,
            "instrument": run_data.instrument,
            "flowcell": run_data.flowcell,
            "seq_type": run_data.seq_type,
            "loading_pattern": run_data.loading_pattern
        }])
        runs_df = pd.concat([runs_df, new_run], ignore_index=True)
        
        # Add new libraries
        new_libs = []
        for lib in run_data.libraries:
            new_libs.append({
                "run_id": run_data.run_id,
                "s_no": lib.s_no,
                "name": lib.name,
                "samples": lib.samples,
                "reads": lib.reads,
                "remarks": lib.remarks
            })
        libs_df = pd.concat([libs_df, pd.DataFrame(new_libs)], ignore_index=True)
        
        # Save back
        with pd.ExcelWriter(EXCEL_FILE, engine='openpyxl') as writer:
            runs_df.to_excel(writer, sheet_name='Runs', index=False)
            libs_df.to_excel(writer, sheet_name='Libraries', index=False)
            
    return {"status": "success", "message": f"Run {run_data.run_id} saved successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
