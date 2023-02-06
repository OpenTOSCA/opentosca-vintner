#!/usr/bin/env bash
set -e

write_input() {
  echo $1 | socat EXEC:"docker attach vpi",pty STDIN
}

write_input 'pi'
sleep 2

write_input 'raspberry'
sleep 3

write_input 'sudo systemctl start ssh'
sleep 2

write_input 'exit'
sleep 2

# TODO: install libc5