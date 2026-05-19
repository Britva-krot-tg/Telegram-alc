from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "database.db" 
REGEN_RATE = 1.0
CLICK_POWER = 0.0025

class ClickRequest(BaseModel):
    user_id: str

class UpgradeRequest(BaseModel):
    user_id: str
    level: int

def calculate_max_energy(level: int):
    if level == 1: return 400 * 2
    if level == 2: return 400 * 10
    if level == 3: return 400 * 50
    if level == 4: return 400 * 100
    return 400

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                score REAL DEFAULT 0.0,
                energy INTEGER DEFAULT 400,
                last_active REAL DEFAULT 0.0,
                upgrade_level INTEGER DEFAULT 0
            )
        ''')
        conn.commit()

init_db()

def get_updated_user(user_id: str):
    current_time = time.time()
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT score, energy, last_active, upgrade_level FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        
        if not row:
            cursor.execute("INSERT INTO users (user_id, score, energy, last_active, upgrade_level) VALUES (?, 0.0, 400, ?, 0)",
                           (user_id, current_time))
            conn.commit()
            return {"score": 0.0, "energy": 400, "max_energy": 400, "upgrade_level": 0, "click_power": CLICK_POWER}
        
        score, energy, last_active, upgrade_level = row
        max_energy = calculate_max_energy(upgrade_level)
        
        # Считаем регенерацию на основе уровня энергии юзера
        time_passed = current_time - last_active
        gained_energy = int(time_passed * REGEN_RATE)
        new_energy = min(max_energy, energy + gained_energy)
        
        cursor.execute("UPDATE users SET energy = ?, last_active = ? WHERE user_id = ?", 
                       (new_energy, current_time, user_id))
        conn.commit()
        
        return {
            "score": score, 
            "energy": new_energy, 
            "max_energy": max_energy, 
            "upgrade_level": upgrade_level,
            "click_power": CLICK_POWER
        }

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    return get_updated_user(user_id)

@app.post("/api/click")
def make_click(data: ClickRequest):
    user = get_updated_user(data.user_id)
    
    if user["energy"] < 1:
        raise HTTPException(status_code=400, detail="Not enough energy")
    
    new_score = user["score"] + CLICK_POWER
    new_energy = user["energy"] - 1
    current_time = time.time()
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET score = ?, energy = ?, last_active = ? WHERE user_id = ?",
                       (new_score, new_energy, current_time, data.user_id))
        conn.commit()
    
    return {"score": new_score, "energy": new_energy}

@app.post("/api/upgrade")
def buy_upgrade(data: UpgradeRequest):
    user = get_updated_user(data.user_id)
    new_max_energy = calculate_max_energy(data.level)
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET upgrade_level = ?, energy = ? WHERE user_id = ?", 
                       (data.level, new_max_energy, data.user_id))
        conn.commit()
        
    return {"upgrade_level": data.level, "max_energy": new_max_energy}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)