#!/bin/bash

# Acessa a pasta onde o script está localizado
cd "$(dirname "$0")"

echo "====================================="
echo "Inicializando a API Diabetica (LLM)"
echo "====================================="

# Verifica se o ambiente virtual (venv) já existe, se não, cria
if [ ! -d "venv" ]; then
    echo "[!] Ambiente virtual não encontrado. Criando um novo..."
    python3 -m venv venv
    echo "[+] Ambiente virtual criado em Diabetica/venv"
fi

# Ativa o ambiente virtual
echo "[*] Ativando ambiente virtual..."
source venv/bin/activate

# Instala/atualiza as dependências silenciosamente
echo "[*] Verificando e instalando dependências necessárias..."
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "[+] Dependências prontas!"

# Inicia a aplicação
echo "[*] Iniciando a API Flask..."
echo "====================================="
python app.py
