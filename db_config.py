import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="12/12=1shals",
        database="grocery_app",
        use_pure=True  
    )
