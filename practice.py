import torch
import torch.nn as nn 

embedding = nn.Embedding(27,2)

print(embedding(torch.tensor(9)).tolist())