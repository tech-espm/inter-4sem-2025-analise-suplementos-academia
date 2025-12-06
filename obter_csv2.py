import banco
import pandas as pd
from unidecode import unidecode

produtos = banco.listarProdutos()
df = pd.DataFrame(produtos)
df = df.drop("id", axis=1)

dummies = df["categorias"].str.replace(" ", "").str.lower().apply(unidecode).str.get_dummies(sep=",")
df = pd.concat([df.drop("categorias", axis=1), dummies], axis=1)
df.loc[44, "estrelas_media"] = 4.0 # Valor não obtido na raspagem

df.to_csv("produtos.csv", index=False, encoding="utf-8-sig", sep=";", quoting=1, decimal=",")