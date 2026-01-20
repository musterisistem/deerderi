import base64
import os

path = r"I:\ANTIGRAVITY\PROJELER\DEER_DERI\assets\logo.png"
if os.path.exists(path):
    size = os.path.getsize(path)
    if size < 100000: # 100KB limit
        with open(path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            print(f"data:image/png;base64,{encoded_string}")
    else:
        print("TOO_LARGE")
else:
    print("NOT_FOUND")
