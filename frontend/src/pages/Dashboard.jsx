import { useState, useEffect, useRef } from "react";

export default function Dashboard() {
    // ─── 1. ARCHITECTURE STATE (The Wireframe Skeleton) ───
    const [grievances, setGrievances] = useState([]); // Starts empty!
    const [backendStatus, setBackendStatus] = useState("Checking..."); 
    const [aiStatus, setAiStatus] = useState("STANDBY"); 
    
    const [grievanceText, setGrievanceText] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileRef = useRef(null);

    // ─── 2. LIVE HEALTH CHECK (Simulating Node.js connection) ───
    useEffect(() => {
        // In the next step, we will wire this to your actual Node.js backend
        setTimeout(() => {
            setBackendStatus("CONNECTED");
        }, 1500);
    }, []);

    // ─── 3. AI PIPELINE TRIGGER ───
    const runAiFramework = (e) => {
        e.preventDefault();
        if (!grievanceText && !uploadedFile) {
            alert("Please provide text or a document to test the AI pipeline.");
            return;
        }

        setAiStatus("CONNECTING TO PORT 8000...");
        console.log("System: Handshaking with BhashaFlow AI-Engine (FastAPI)...");
        
        setTimeout(() => {
            setAiStatus("ANALYZING (OCR & NLP)...");
            setTimeout(() => setAiStatus("STANDBY"), 3000);
        }, 1500);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#010b1f", color: "#e2e8f0", fontFamily: "sans-serif", padding: "20px" }}>
            
            {/* ─── SYSTEM STATUS BAR (Shows off your DevOps architecture) ─── */}
            <div style={{ 
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,153,51,0.2)", 
                borderRadius: "8px", padding: "12px 20px", display: "flex", gap: "24px",
                fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "30px" 
            }}>
                <span style={{ color: backendStatus === "CONNECTED" ? "#34d399" : "#fbbf24" }}>
                    ● NODE.JS BACKEND: {backendStatus}
                </span>
                <span style={{ color: "#60a5fa" }}>
                    ● MONGODB: ACTIVE
                </span>
                <span style={{ color: aiStatus === "STANDBY" ? "#f87171" : "#FF9933" }}>
                    ● AI ENGINE (FASTAPI): {aiStatus}
                </span>
            </div>

            {/* ─── HEADER ─── */}
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ color: "#fff", fontSize: "28px", textShadow: "0 0 15px rgba(255,153,51,0.3)" }}>
                    BhashaFlow Command Center
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>Multilingual AI Grievance Routing Prototype</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                
                {/* ─── LEFT: SUBMISSION PORTAL ─── */}
                <div style={{ 
                    background: "rgba(5,12,28,0.8)", border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "12px", padding: "24px" 
                }}>
                    <h3 style={{ marginBottom: "15px", color: "#FF9933" }}>File New Grievance (Test Input)</h3>
                    
                    <textarea 
                        value={grievanceText}
                        onChange={(e) => setGrievanceText(e.target.value)}
                        placeholder="Type a grievance in any Indian language to test the pipeline..."
                        style={{ 
                            width: "100%", height: "120px", padding: "12px", borderRadius: "8px", 
                            background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid #334155",
                            marginBottom: "15px", resize: "none"
                        }}
                    />

                    <div 
                        onClick={() => fileRef.current?.click()}
                        style={{ 
                            border: "2px dashed #475569", borderRadius: "8px", padding: "20px", 
                            textAlign: "center", cursor: "pointer", marginBottom: "20px",
                            background: uploadedFile ? "rgba(52,211,153,0.1)" : "transparent"
                        }}
                    >
                        <input type="file" ref={fileRef} style={{ display: "none" }} onChange={(e) => setUploadedFile(e.target.files[0])} />
                        <span style={{ color: uploadedFile ? "#34d399" : "#94a3b8" }}>
                            {uploadedFile ? `Attached: ${uploadedFile.name}` : "+ Attach Document for OCR (JPG, PDF)"}
                        </span>
                    </div>

                    <button 
                        onClick={runAiFramework}
                        style={{ 
                            width: "100%", padding: "14px", borderRadius: "8px", border: "none",
                            background: "linear-gradient(90deg, #FF9933, #e07010)", 
                            color: "#fff", fontWeight: "bold", cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(255,153,51,0.3)"
                        }}
                    >
                        {aiStatus === "STANDBY" ? "Run AI Pipeline (Test Mode)" : "Processing..."}
                    </button>
                </div>

                {/* ─── RIGHT: EMPTY STATE FEED ─── */}
                <div>
                    <h3 style={{ marginBottom: "15px", color: "#e2e8f0" }}>Live Database Feed</h3>
                    
                    {grievances.length === 0 ? (
                        // Professional Empty State UX
                        <div style={{ 
                            border: "1px dashed #475569", borderRadius: "12px", padding: "60px 20px", 
                            textAlign: "center", background: "rgba(255,255,255,0.02)"
                        }}>
                            <div style={{ fontSize: "40px", marginBottom: "15px" }}>📭</div>
                            <h4 style={{ color: "#e2e8f0", marginBottom: "8px" }}>No grievances found</h4>
                            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
                                The MongoDB database is currently empty. <br/>
                                Use the portal on the left to submit a test document and trigger the AI classification engine.
                            </p>
                        </div>
                    ) : (
                        <div>{/* Real cards will map here later */}</div>
                    )}
                </div>

            </div>
        </div>
    );
}