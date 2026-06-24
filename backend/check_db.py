import psycopg2
import os
import environ

env = environ.Env()
environ.Env.read_env('.env')

db_url = env('DATABASE_URL')
print(f"Connecting to {db_url}")

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
tables = cur.fetchall()
print("TABLES:", tables)
