# IMPORTANTE: Esse código deve ser rodado apenas offline, não rodar durante a execução do projeto

import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.svm import SVR

# Carregamento dos dados

df = pd.read_csv("produtos.csv", sep=";", encoding="UTF8")

df = df[df["recomendacoes"] > 0]

df["preco"] = df["preco"].str.replace(",", ".").astype(float)
df["estrelas_media"] = df["estrelas_media"].str.replace(",", ".").astype(float)

features_num = ["preco", "estrelas_media", "avaliacoes"]
features_cat = ["formato"]

X_num = df[features_num]
X_cat = df[features_cat]
y = df["recomendacoes"]

# Pré-processamento

scaler = StandardScaler()
encoder = OneHotEncoder(handle_unknown="ignore")

X_num_scaled = scaler.fit_transform(X_num)
X_cat_encoded = encoder.fit_transform(X_cat)

X = pd.concat([
    pd.DataFrame(X_num_scaled, columns=features_num),
    pd.DataFrame(X_cat_encoded.toarray(),
                 columns=encoder.get_feature_names_out())
], axis=1)

# Treino

svm = SVR(kernel="linear", C=10, epsilon=1.1)
svm.fit(X, y)

joblib.dump(svm, "models/svm_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(encoder, "models/encoder.pkl")

print("Modelo salvo com sucesso.")