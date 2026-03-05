import os
from pathlib import Path

def check_missing_translations(content_type):
    base_dir = Path(f"src/content/{content_type}")
    missing = []
    
    for en_file in base_dir.glob("*-en.md"):
        fr_file = en_file.parent / en_file.name.replace("-en.md", "-fr.md")
        
        if not fr_file.exists():
            missing.append(en_file.name)
    
    return missing

print("=== MISSING FRENCH BOOKS ===")
books = check_missing_translations("books")
if books:
    for b in books:
        print(b)
else:
    print("All books have French translations!")

print("\n=== MISSING FRENCH PAPERS ===")
papers = check_missing_translations("papers")
if papers:
    for p in papers:
        print(p)
else:
    print("All papers have French translations!")

print("\n=== MISSING FRENCH PODCASTS ===")
podcasts = check_missing_translations("podcasts")
if podcasts:
    for p in podcasts[:10]:
        print(p)
else:
    print("All podcasts have French translations!")

print("\n=== MISSING FRENCH VIDEOS ===")
videos = check_missing_translations("videos")
if videos:
    for v in videos[:10]:
        print(v)
else:
    print("All videos have French translations!")
