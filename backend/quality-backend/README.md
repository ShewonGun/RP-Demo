# HydroTwin — Water Quality & Contamination-Risk Prediction Backend
## Component 4: Physics-Informed Digital Twin (Simulated ST-GNN)

This folder contains the Python FastAPI backend which simulates water contamination predictions, node-level pressure decays, and residual chlorine deterioration over the Kaduwela DMA-2 network graph.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
You need Python 3.8+ installed. Run:
```bash
pip install -r requirements.txt
```

### 2. Start the Development Server
Start the FastAPI server on port `8000`:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Verify Server Status
Once running, you can access:
- **API root:** `http://localhost:8000/`
- **Interactive docs (Swagger UI):** `http://localhost:8000/docs`
- **JSON graph model:** `http://localhost:8000/api/network-graph`
