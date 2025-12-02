import banco
import pandas as pd

produtos = banco.listarProdutos()
df = pd.DataFrame(produtos)
df = df.drop("id", axis=1)

dummies = df["categorias"].str.replace(" ", "").str.get_dummies(sep=",")
df = pd.concat([df.drop("categorias", axis=1), dummies], axis=1)

df.to_csv("produtos.csv", index=False, encoding="utf-8")