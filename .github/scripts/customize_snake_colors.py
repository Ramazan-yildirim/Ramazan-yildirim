import sys

file_path = sys.argv[1]

# Buraya kendi istediğin renkleri yaz
color_map = {
    "#0e4429": "#ff6f61",  # Çok az katkı → turuncu
    "#006d32": "#ffb347",  # Az katkı → açık turuncu
    "#26a641": "#ffd700",  # Orta katkı → sarı
    "#39d353": "#00bfff",  # Çok katkı → mavi
}

with open(file_path, "r") as f:
    svg = f.read()

for orig, new in color_map.items():
    svg = svg.replace(orig, new)

with open(file_path, "w") as f:
    f.write(svg)

