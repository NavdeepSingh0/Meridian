import psycopg2
import os
import environ

env = environ.Env()
environ.Env.read_env('.env')

db_url = env('DATABASE_URL')
print(f"Connecting to {db_url.split('@')[-1]}")

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    with open('../supabase_profiles_migration.sql', 'r') as f:
        sql = f.read()
        
    print("Executing migration...")
    cur.execute(sql)
    print("Migration executed successfully!")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
