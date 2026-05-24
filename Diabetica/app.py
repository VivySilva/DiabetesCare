import torch
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
from threading import Thread
import random

app = Flask(__name__)


#device = "cuda" # the device to load the model onto


# Configurações do Modelo
MODEL_PATH = 'WaltonFuture/Diabetica-1.5B'
device = "cuda"      

print(f"Carregando modelo {MODEL_PATH} no dispositivo: {device}...")

# Carregar Tokenizer e Modelo (Isso pode levar tempo e exigir muita memória)
# Em um ambiente de produção real, isso seria feito com otimizações
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        torch_dtype="auto",
        device_map="auto" if torch.cuda.is_available() else None
    ).eval()
    print("Modelo carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o modelo: {e}")
    model = None
    tokenizer = None

def generate_response(message, history):
    if model is None or tokenizer is None:
        return "Erro: Modelo não carregado corretamente."

    messages = [
        {"role": "system", "content": "Você é um assistente especializado em diabetes, baseado no modelo Diabetica. Seja extremamente breve e conciso nas suas respostas (no máximo 2 a 3 frases curtas). Forneça informações precisas sobre diabetes, mas sempre recomende que o usuário consulte um médico para decisões clínicas."},
    ]
    
    # Adicionar histórico
    for chat in history:
        messages.append({"role": "user", "content": chat[0]})
        messages.append({"role": "assistant", "content": chat[1]})
    
    # Adicionar mensagem atual
    messages.append({"role": "user", "content": message})

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    # Configuração de geração simples (não-streaming para a API REST básica)
    generated_ids = model.generate(
        model_inputs.input_ids,
        max_new_tokens=256,
        do_sample=True,
        temperature=0.7,
        top_p=0.9
    )
    
    # Remover os tokens de entrada da saída gerada
    response_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(response_ids, skip_special_tokens=True)[0]
    return response

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Mensagem não fornecida"}), 400
    
    message = data.get('message')
    history = data.get('history', [])
    
    try:
        response = generate_response(message, history)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
