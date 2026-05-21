from collections import defaultdict

DEPENDENCIES: list[tuple[str, str]] = [
    ("algebra", "calculus"),
    ("calculus", "linear-algebra"),
    ("calculus", "probability"),
    ("probability", "machine-learning"),
    ("python", "machine-learning"),
    ("python", "dsa"),
    ("dsa", "competitive-programming"),
    ("dsa", "systems"),
    ("c", "systems"),
    ("networking", "systems"),
    ("statistics", "machine-learning"),
    ("linear-algebra", "machine-learning"),
    ("writing", "research-methods"),
    ("research-methods", "thesis"),
    ("hackathon", "teamwork"),
    ("dsa", "hackathon"),
    ("c", "embedded-c"),
    ("embedded-c", "microcontrollers"),
    ("microcontrollers", "embedded-systems"),
    ("digital-electronics", "microcontrollers"),
    ("digital-electronics", "fpga"),
    ("verilog", "fpga"),
    ("vhdl", "fpga"),
    ("digital-electronics", "vlsi"),
    ("analog-electronics", "pcb-design"),
    ("digital-electronics", "pcb-design"),
    ("signals-and-systems", "signal-processing"),
    ("signals-and-systems", "communication-systems"),
    ("signals-and-systems", "control-systems"),
    ("networking", "iot"),
    ("microcontrollers", "iot"),
]


def forward_adj() -> dict[str, list[str]]:
    g: dict[str, list[str]] = defaultdict(list)
    for a, b in DEPENDENCIES:
        g[a].append(b)
    return dict(g)


def reverse_adj() -> dict[str, list[str]]:
    g: dict[str, list[str]] = defaultdict(list)
    for a, b in DEPENDENCIES:
        g[b].append(a)
    return dict(g)
