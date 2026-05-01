from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI   
import re 
import torch  
import torch.nn as nn

app = FastAPI()  

vocab = [" ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

embedding = nn.Embedding(27,2)
position_embedding = nn.Embedding(21,2)


def normalize(text):
    text = text.lower()
    new_text = ""
    for char in text:
        if char in vocab:
            new_text = new_text + char 
        else:
            new_text = new_text + " "
    new_text = re.sub(r'\s+', ' ', new_text)
    return new_text

vocab_lookup = {}
for i,c in enumerate(vocab):
    dictionary = {
        "char": c,
        "index": i,
        "embedding": embedding(torch.tensor(i)).tolist()
    }
    vocab_lookup[c] = dictionary

position_lookup = {}
for i in range(21):
    dictionary = {
        "position": i,
        "embedding": position_embedding(torch.tensor(i)).tolist()
    }
    position_lookup[i] = dictionary

print(position_lookup)



@app.get('/vocab_lookup')
def get_vocab_lookup():
    return vocab_lookup

@app.get('/position_lookup')
def get_position_lookup():
    return position_lookup
        
@app.get('/embed_text')
def embed_text(text: str):
    


    

app.mount("/", StaticFiles(directory="static", html=True), name="static")