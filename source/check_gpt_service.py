"""Service replying to user utterance."""
import tensorflow as tf
import numpy as np
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
from keras.preprocessing.text import Tokenizer
import pandas as pd

class CheckGPTService:
    
    def __init__(self):
        self.modelRNN = tf.keras.models.load_model("ai_detection_model_deep_rnn.h5")
        self.modelCNN = tf.keras.models.load_model("model_cnn_text_classification_2.h5")

    def check_review(self, message: str) -> str:
        print('review', message)
        return '200 OK'
        
    def generate_reply(self, utterance: list[str], model: str) -> str:
        # Загрузка данных для токенизатора
        data = pd.concat([pd.read_csv('comment_texsts_v1.csv', encoding="cp1251", sep=";"), pd.read_csv('giga_texts.csv', encoding="cp1251", sep=";")], ignore_index=True)
        tokenizer = Tokenizer()
        tokenizer.fit_on_texts(data['text'])

        result = []

        if model == 'modelY' :
            for i in range(len(utterance)):
                sequence = tokenizer.texts_to_sequences([utterance[i]])
                sequence = [[idx for idx in seq if idx < 10000] for seq in sequence]
                # Выравнивание последовательности до необходимой длины
                padded_sequence = pad_sequences(sequence, maxlen=100)
                # Предсказание вероятности
                prediction = self.modelCNN.predict(padded_sequence)
                probability = prediction[0, 0]
                result.append(f"Вероятность, что текст написан AI: {probability:.2%}")
        else :
            for i in range(len(utterance)):
                sequence = tokenizer.texts_to_sequences([utterance[i]])
                # Выравнивание последовательности до необходимой длины
                padded_sequence = pad_sequences(sequence, maxlen=250)
                # Предсказание вероятности
                prediction = self.modelRNN.predict(padded_sequence)
                probability = prediction[0, 0]
                result.append(f"Вероятность, что текст написан AI: {probability:.2%}")

        return result