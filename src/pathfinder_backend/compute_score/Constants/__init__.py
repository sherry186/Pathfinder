#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import numpy as np

# shape: [外語能力, 閱讀理解, 文字創作, 藝術創作, 寫作表達, 助人能力, 領導協調, 說服推廣, 文書處理, 組織能力, 抽象推理, 科學能力, 數學推理, 圖形推理, 計算能力, 操作能力, 空間理解, 機械推理]
DEPARTMENTS = []
WEIGHT_MATRIX = []
KEYS = ["外語能力", "閱讀理解", "文字創作", "藝術創作", "寫作表達", "助人能力", "領導協調", "說服推廣", "文書處理", "組織能力", "抽象推理", "科學能力", "數學推理", "圖形推理", "計算能力", "操作能力", "空間理解", "機械推理"]

with open('./department_weights.json', "r") as f:
    data = json.load(f)
    for item in data:
        w = item["weights"]
        weights_array = []
        DEPARTMENTS.append(item["department"])
        for key in KEYS:
            if key not in w:
                w[key] = 0
            weights_array.append(w[key])
        WEIGHT_MATRIX.append(weights_array)
WEIGHT_MATRIX = np.array(WEIGHT_MATRIX)
#print(DEPARTMENTS)
#print(WEIGHT_MATRIX)