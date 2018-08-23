#!/usr/bin/env python3

import tempfile
import signal
import sys
import subprocess
import random
import re

from init_generator import generate_init_context

#if len(sys.argv) != 4:
#  print('Usage: execute.py <path to ceptre> <cep file> <num steps>')
#  sys.exit(1)
#
ceptre = sys.argv[1]
#cep = sys.argv[2]
steps = int(sys.argv[2])
num_steps = steps
#
rule_option_regex = re.compile(r'^\d+: \(.+\)')


def start_ceptre(cep_file):
  global steps, num_steps, ceptre
  options = []
  print(cep_file)
  with subprocess.Popen([ceptre, cep_file], stdout=subprocess.PIPE, stdin=subprocess.PIPE, bufsize=1) as proc:
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

if __name__ == '__main__':
  #with tempfile.NamedTemporaryFile('w+') as f:
  with open('script.cep', 'w+') as f:
    with open('defs.inc.cep', 'r') as df:
      f.write(df.read())
    generate_init_context(f)
    with open('rules.inc.cep', 'r') as rf:
      f.write(rf.read())
    f.flush()
    start_ceptre(f.name)
