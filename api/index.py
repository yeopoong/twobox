# api/index.py
import sys
import os

# 프로젝트 루트 및 backend 폴더를 파이썬 경로(sys.path)에 추가
# Vercel 환경에서 backend.app.main 임포트를 원활하게 하기 위함입니다.
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from backend.app.main import app
