#!/usr/bin/env python3

import signal
import sys
import subprocess
import random
import re

if len(sys.argv) != 4:
    print('Usage: execute.py <path to ceptre> <cep file> <num steps>')
    sys.exit(1)

ceptre = sys.argv[1]
cep = sys.argv[2]
steps = int(sys.argv[3])
num_steps = steps

rule_option_regex = re.compile(r'^\d+: \(.+\)')

options = []

with subprocess.Popen([ceptre, cep], stdout=subprocess.PIPE, stdin=subprocess.PIPE, bufsize=1) as proc:
    buf = ''
    while True:
        char = proc.stdout.read(1).decode('utf-8')
        buf += char
        if char == '\n':
            if rule_option_regex.match(buf):
                options.append(buf)
            buf = ''
        elif buf == '?- ':
            steps -= 1
            if steps <= 0:
                proc.stdin.write(b'0\n')
                proc.stdin.close()
                print('Finishing simulation')
                break
            else:
                option = random.randrange(1, len(options))
                print('%s/%s picking %s (of %s)' % (num_steps - steps, num_steps, options[option].rstrip(), len(options)))
                proc.stdin.write(b'%s\n' % str(option).encode('utf-8'))
                proc.stdin.flush()
                # abort early
                if ('murder' in options[option]):
                    print('Murder happened!')
                    steps = 0
                options = []

subprocess.run('dot -Tsvg trace.dot -o trace.svg'.split(' '))
subprocess.run('xdg-open trace.svg'.split(' '))
