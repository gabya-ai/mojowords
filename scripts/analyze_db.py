
import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables from .env to get the connection string
load_dotenv()

# Get the connection string (use POSTGRES_URL_NON_POOLING or DATABASE_URL)
# Note: For analysis, we often use the non-pooling URL if available to avoid timeouts, 
# but DATABASE_URL works for simple queries.
db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("❌ Error: DATABASE_URL not found in .env")
    exit(1)

print("🔌 Connecting to database...")

try:
    # Create SQLAlchemy engine
    # We use sqlalchemy because pandas 'read_sql' works best with it
    engine = create_engine(db_url)

    # Example 1: Load Users
    print("📊 Fetching Users...")
    df_users = pd.read_sql("SELECT * FROM \"User\"", engine)
    print(f"   Found {len(df_users)} users.")
    print(df_users.head())
    print("-" * 30)

    # Example 2: Load Words with simple analysis
    print("📊 Fetching Words...")
    df_words = pd.read_sql("SELECT * FROM \"Word\"", engine)
    print(f"   Found {len(df_words)} words.")
    
    if not df_words.empty:
        # Simple Data Science Analysis: Distribution of Difficulty
        print("\n📈 Difficulty Distribution:")
        print(df_words['difficulty'].value_counts())
        
        # Mastery Analysis
        print(f"\n🧠 Average Mastery: {df_words['mastery'].mean():.2f}")

    # Example 3: Advanced Query (Join)
    # Get average mastery per user
    print("\n📊 User Performance (Aggregation):")
    query = """
    SELECT 
        u.name, 
        COUNT(w.id) as word_count, 
        AVG(w.mastery) as avg_mastery 
    FROM "User" u
    JOIN "Word" w ON u.id = w."userId"
    GROUP BY u.name
    """
    df_performance = pd.read_sql(query, engine)
    print(df_performance)

    print("\n✅ Analysis Complete. Data is now in pandas dataframes (df_users, df_words) ready for ML/Plotting.")

except Exception as e:
    print(f"❌ Error connecting or querying: {e}")
    print("\nTip: Ensure you have installed requirements: pip install pandas sqlalchemy psycopg2-binary python-dotenv")
