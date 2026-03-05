import os
from pathlib import Path

def check_translations(content_type):
    base_dir = Path(f"src/content/{content_type}")
    unqualified = []
    
    for en_file in base_dir.glob("*-en.md"):
        fr_file = en_file.parent / en_file.name.replace("-en.md", "-fr.md")
        
        if fr_file.exists():
            with open(en_file, 'r', encoding='utf-8') as f:
                en_lines = len(f.readlines())
            
            with open(fr_file, 'r', encoding='utf-8') as f:
                fr_lines = len(f.readlines())
            
            if fr_lines < en_lines:
                unqualified.append(f"{en_file.name}: {fr_lines}/{en_lines}")
    
    return unqualified

print("=== UNQUALIFIED BOOKS ===")
books = check_translations("books")
if books:
    for b in books:
        print(b)
else:
    print("All books qualified!")

print("\n=== UNQUALIFIED PAPERS ===")
papers = check_translations("papers")
if papers:
    for p in papers:
        print(p)
else:
    print("All papers qualified!")

print("\n=== UNQUALIFIED PODCASTS ===")
podcasts = check_translations("podcasts")
if podcasts:
    for p in podcasts:
        print(p)
else:
    print("All podcasts qualified!")

print("\n=== UNQUALIFIED VIDEOS ===")
videos = check_translations("videos")
if videos:
    for v in videos:
        print(v)
else:
    print("All videos qualified!")
