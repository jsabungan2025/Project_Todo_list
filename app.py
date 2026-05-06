from flask import Flask, render_template, request, jsonify
import csv
import os

app = Flask(__name__)
CSV_FILE = "tasks.csv"

# Ensure CSV exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "completed"])

def read_tasks():
    tasks = []
    with open(CSV_FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tasks.append({
                "text": row["text"],
                "completed": row["completed"] == "True"
            })
    return tasks

def write_tasks(tasks):
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "completed"])
        for task in tasks:
            writer.writerow([task["text"], task["completed"]])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_tasks")
def get_tasks():
    return jsonify(read_tasks())

@app.route("/add_task", methods=["POST"])
def add_task():
    tasks = read_tasks()
    data = request.json
    tasks.append({"text": data["text"], "completed": False})
    write_tasks(tasks)
    return jsonify({"status": "success"})

@app.route("/delete_task", methods=["POST"])
def delete_task():
    tasks = read_tasks()
    index = request.json["index"]
    tasks.pop(index)
    write_tasks(tasks)
    return jsonify({"status": "success"})

@app.route("/toggle_task", methods=["POST"])
def toggle_task():
    tasks = read_tasks()
    index = request.json["index"]
    tasks[index]["completed"] = not tasks[index]["completed"]
    write_tasks(tasks)
    return jsonify({"status": "success"})

@app.route("/edit_task", methods=["POST"])
def edit_task():
    tasks = read_tasks()
    data = request.json
    tasks[data["index"]]["text"] = data["text"]
    write_tasks(tasks)
    return jsonify({"status": "success"})

@app.route("/clear_completed", methods=["POST"])
def clear_completed():
    tasks = [t for t in read_tasks() if not t["completed"]]
    write_tasks(tasks)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)
