from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI   
import re 
import torch  
import torch.nn as nn

app = FastAPI()  

vocab = [" ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

vocab_dictionary = {}
for i,char in enumerate(vocab):
    vocab_dictionary[char] = i

@app.get('/vocab')
def get_vocab():
    return vocab_dictionary

@app.get('/encode')
def get_encoding(text: str):
    encoding = []
    for char in text:
        encoding.append(vocab_dictionary[char])
    return encoding

app.mount("/", StaticFiles(directory="static", html=True), name="static")