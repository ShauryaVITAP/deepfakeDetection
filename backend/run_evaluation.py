import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app.pipeline.evaluate_test_dataset import run_evaluation

if __name__ == '__main__':
    run_evaluation()
