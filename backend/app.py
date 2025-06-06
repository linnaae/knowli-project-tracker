from flask import Flask, render_template, request, redirect, jsonify
from flask_cors import CORS
from rapidfuzz import fuzz
import sqlite3
import os
import json

app = Flask(__name__)
CORS(app)
DB_FILE = "projects.db"

# Get the absolute path to the JSON file from the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TAG_OPTIONS_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'src', 'constants', 'tagOptions.json'))

def load_known_categories():
    with open(TAG_OPTIONS_PATH) as f:
        return json.load(f)

known_categories = load_known_categories()

# Create database table if it doesn't exist
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                doc_path TEXT
            )
        ''')

        conn.execute('''
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                category TEXT,
                value TEXT,
                FOREIGN KEY(project_id) REFERENCES projects(id)
            )
        ''')

#define a function to consistently use tagOptions.json
def detect_tag_category(value):
    for category, values in known_categories.items():
        if value in values:
            return category
    return 'extra'


@app.route('/', methods=['GET'])
def index():
    query = request.args.get('q', '').strip().lower()

    # Get filter values as lists
    client_filter = request.args.getlist('client')
    domain_filter = request.args.getlist('domain')
    tech_filter = request.args.getlist('technology')
    project_type_filter = request.args.getlist('project_type')

    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, title, description FROM projects ORDER BY id DESC')
        projects = cur.fetchall()

        cur.execute('SELECT project_id, category, value FROM tags')
        tag_rows = cur.fetchall()

    # Build tag structures
    project_tags = {}
    tag_map = {}  # {project_id: {category: [values]}}
    for pid, cat, val in tag_rows:
        project_tags.setdefault(pid, []).append(val)
        tag_map.setdefault(pid, {}).setdefault(cat, []).append(val)

    # Filtering logic for multiple values per category
    def matches_filters(project_id):
        tags = tag_map.get(project_id, {})

        if client_filter and not any(tag in tags.get('client', []) for tag in client_filter):
            return False
        if domain_filter and not any(tag in tags.get('domain', []) for tag in domain_filter):
            return False
        if tech_filter and not any(tag in tags.get('technology', []) for tag in tech_filter):
            return False
        if project_type_filter and not any(tag in tags.get('project_type', []) for tag in project_type_filter):
            return False

        return True

    projects = [p for p in projects if matches_filters(p[0])]

    # Fuzzy search
    if query:
        def score_project(project):
            combined = f"{project[1]} {project[2]} {' '.join(project_tags.get(project[0], []))}".lower()
            return fuzz.partial_ratio(query, combined)

        scored_projects = [(project, score_project(project)) for project in projects]
        scored_projects = [p for p in scored_projects if p[1] > 60]
        scored_projects.sort(key=lambda p: p[1], reverse=True)
        projects = [p[0] for p in scored_projects]

    return render_template('index.html', projects=projects, project_tags=project_tags)




@app.route('/edit/<int:project_id>', methods=['GET', 'POST'])
def edit(project_id):
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']

        # Rebuild tag list from form
        all_tags = []
        for category in ['client', 'client_type', 'domain', 'technology', 'project_type']:
            for value in request.form.getlist(category):
                all_tags.append((category, value))

        extra_tags = request.form.get('extra_tags', '')
        for value in [tag.strip() for tag in extra_tags.split(',') if tag.strip()]:
            all_tags.append(('extra', value))

        with sqlite3.connect(DB_FILE) as conn:
            cur = conn.cursor()

            # Update project
            cur.execute('UPDATE projects SET title = ?, description = ? WHERE id = ?', (title, description, project_id))

            # Delete old tags
            cur.execute('DELETE FROM tags WHERE project_id = ?', (project_id,))

            # Insert updated tags
            for category, value in all_tags:
                cur.execute('INSERT INTO tags (project_id, category, value) VALUES (?, ?, ?)', (project_id, category, value))

        return redirect('/')

    # GET request
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, title, description FROM projects WHERE id = ?', (project_id,))
        project = cur.fetchone()

        cur.execute('SELECT category, value FROM tags WHERE project_id = ?', (project_id,))
        tag_rows = cur.fetchall()

    # Group tags by category
    tag_map = {}
    for cat, val in tag_rows:
        tag_map.setdefault(cat, []).append(val)

    return render_template('edit.html', project=project, tag_map=tag_map)


@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def api_update_project(project_id):
    data = request.get_json()
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    tags = data.get('tags', [])

    if not title or not description:
        return jsonify({'error': 'Missing title or description'}), 400

    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('UPDATE projects SET title = ?, description = ? WHERE id = ?', (title, description, project_id))
        cur.execute('DELETE FROM tags WHERE project_id = ?', (project_id,))

        for value in tags:
            value_clean = value.strip()
            category = detect_tag_category(value_clean)

            cur.execute(
                'INSERT INTO tags (project_id, category, value) VALUES (?, ?, ?)',
                (project_id, category, value_clean)
            )

    return jsonify({'success': True}), 200


@app.route('/api/projects/<int:project_id>', methods=['GET'])
def api_get_project(project_id):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, title, description FROM projects WHERE id = ?', (project_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({'error': 'Project not found'}), 404

        cur.execute('SELECT category, value FROM tags WHERE project_id = ?', (project_id,))
        tags = [tag for tag in cur.fetchall()]

    return jsonify({
        'id': row[0],
        'title': row[1],
        'description': row[2],
        'tags': [value for category, value in tags]
    })


@app.route('/delete/<int:project_id>', methods=['POST'])
def delete(project_id):
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    return redirect('/')

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def api_delete_project(project_id):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM tags WHERE project_id = ?', (project_id,))
        cur.execute('DELETE FROM projects WHERE id = ?', (project_id,))
        conn.commit()
    return '', 204  # No Content


@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']

        # Insert project first
        with sqlite3.connect(DB_FILE) as conn:
            cur = conn.cursor()
            cur.execute('INSERT INTO projects (title, description) VALUES (?, ?)', (title, description))
            project_id = cur.lastrowid

            # Insert structured tags
            for category in ['client', 'client_type', 'domain', 'technology', 'project_type']:
                for value in request.form.getlist(category):
                    cur.execute('INSERT INTO tags (project_id, category, value) VALUES (?, ?, ?)', (project_id, category, value))

            # Insert freeform tags
            extra_tags = request.form.get('extra_tags', '')
            for value in [tag.strip() for tag in extra_tags.split(',') if tag.strip()]:
                cur.execute('INSERT INTO tags (project_id, category, value) VALUES (?, ?, ?)', (project_id, 'extra', value))

        return redirect('/')

    return render_template('create.html')

@app.route('/api/projects')
def api_projects():
    query = request.args.get('q', '').strip().lower()

    # Dynamically load filters using known categories
    active_filters = {
        category: request.args.getlist(category)
        for category in known_categories
    }

    unknown_params = set(request.args.keys()) - set(known_categories.keys()) - {'q'}
    if unknown_params:
        print("Unexpected filters received:", unknown_params)

    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, title, description FROM projects ORDER BY id DESC')
        projects = cur.fetchall()

        cur.execute('SELECT project_id, category, value FROM tags')
        tag_rows = cur.fetchall()

        tag_map = {}  # {project_id: {category: [values]}}
        for pid, cat, val in tag_rows:
            tag_map.setdefault(pid, {}).setdefault(cat, []).append(val)

    match_modes = {
        category: request.args.get(f"{category}_match", "any")
        for category in known_categories
    }

    def matches_filters(pid):
        tags = tag_map.get(pid, {})

        for category, selected in active_filters.items():
            if not selected:
                continue

            values = tags.get(category, [])

            if match_modes.get(category) == "all":
                if not all(val in values for val in selected):
                    return False
            else:  # "any" (default)
                if not any(val in values for val in selected):
                    return False

        return True



    filtered_projects = [p for p in projects if matches_filters(p[0])]

    # Fuzzy search (optional)
    if query:
        def score_project(project):
            pid = project[0]
            tag_categories = tag_map.get(pid, {})
            flat_tags = [tag for tags in tag_categories.values() for tag in tags]
            combined = f"{project[1]} {project[2]} {' '.join(flat_tags)}".lower()
            return fuzz.partial_ratio(query, combined)

        scored_projects = [(proj, score_project(proj)) for proj in filtered_projects]
        scored_projects = [p for p in scored_projects if p[1] > 60]
        scored_projects.sort(key=lambda p: p[1], reverse=True)
        filtered_projects = [p[0] for p in scored_projects]

    output = []
    for proj in filtered_projects:
        pid, title, desc = proj
        output.append({
            'id': pid,
            'title': title,
            'description': desc,
            'tags': tag_map.get(pid, [])
        })

    return jsonify(output)




@app.route('/api/projects', methods=['POST'])
def api_add_project():
    data = request.get_json()
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    tags = data.get('tags', [])

    if not title or not description:
        return jsonify({'error': 'Missing title or description'}), 400

    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute('INSERT INTO projects (title, description) VALUES (?, ?)', (title, description))
        project_id = cur.lastrowid

        for value in tags:
            value_clean = value.strip()
            category = detect_tag_category(value_clean)

            cur.execute(
                'INSERT INTO tags (project_id, category, value) VALUES (?, ?, ?)',
                (project_id, category, value_clean)
            )

    return jsonify({'success': True, 'id': project_id}), 201




if __name__ == '__main__':
    init_db()
    app.run(debug=True)
