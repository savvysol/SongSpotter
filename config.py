print("""
_________________________________________________
  
  Importing some basic files & functions...
_________________________________________________

""")
# -------------- FUNCTION LIST ------------------
def flist():
    print("""
List of Functions:
• Name >> Returns
-----------------------
General -
    - launch(url) >> brower object
    - see(image_url) >> will show the image Jupyter
    - log(dict) >> will format and print a dict object
    
- Mongo - 
post_mongo(dict, db,col) >> DB connection, Collection
    - will create a connection to DB and Collection
      and post the Dictionary object.



""")



# -------------- DEPENDENICS --------------------

# Mongo:
import pymongo

# System
import os, sys, json, time, pyperclip

# Web
from splinter import Browser
from IPython.display import Image


# ------------------ END ------------------------
# -------------- DEPENDENICS --------------------

client_id='1b963aa209374ea791507cb8f3e51e64'
client_secret='6f0110218a5e4b98ab24cbd033d4a18e'
spot_banner = 'https://storage.googleapis.com/stateless-fluid-blade-23370/molten/2019/05/932eb49d-spotify-logo-banner.gif'
bootcamp = 'spotify:playlist:5ZEpmbyD3EXvgPU6WggRAp'


# --------- General Functions -----------------

def launch(url):
    executable_path = {'executable_path': '/usr/local/bin/chromedriver'}
    browser = Browser('chrome', **executable_path, headless=False)
    browser.visit(url)
    return browser

def log(dict):
    this = json.dumps(dict,sort_keys=False,indent=4)
    return print(this)

# A function to display an image in J.Notebook
def see(my_url,width=300):
    image = Image(url=my_url,width=width)
    return image

def pf(string):
    print(f"""
    -----------------------
      {string}
    
    -----------------------
    """)






# --------- Mongo Functions -----------------

# Make a connection
def connect_mongo():
    conn = "mongodb://localhost:27017"
    client = pymongo.MongoClient(conn)
    #print(f"You're connected! Passing back the client.")
    return client

# Connect to a Collection
def mongo_me(db,col):
    client = connect_mongo()
    collection = client[db][col]
    #print(f"You're connected to DB:{db} | Collection:{col}")
    return client, collection

# Connect & Post all in One.
def post_mongo(dictionary,db_name,collection_name):
    client, collection = mongo_me(db_name,collection_name)
    collection.insert_many(dict)
    #print(f"We posted {len(dict) documents into DB: {db_name} | Col: {collection_name}}")
    return db, collection



# --------- Spotify Functions -----------------
def clear_user(username):
    try:
        os.remove(f'.cache-{username}')
        print(f'{username} cache file removed')
    except:
        print(f'No file for {username} exists.')