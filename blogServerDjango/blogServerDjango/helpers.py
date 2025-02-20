import json
import os
import datetime

def getCurrDir():
    current_dir = os.getcwd()
    return os.path.dirname(os.path.dirname(current_dir))

def getDataFromFile(sFile):
    
    
    data = {}
    try:
        with open(sFile, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file {sFile} does not exist.")
    except json.JSONDecodeError:
        print(f"Error: The file {sFile} is not a valid JSON file or is empty.")
    return data

def getFileLastUpdate(sFile):
    sFile = getCurrDir() + sFile
    print(sFile)
    try:
        timestamp = os.path.getmtime(sFile)
        last_update = datetime.datetime.fromtimestamp(timestamp)
        return last_update
    except OSError as e:
        print(f"Error: {e}")
        return None