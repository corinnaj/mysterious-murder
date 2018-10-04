import re


def apply(template, actors):
    for i in range(len(actors)):
        actor = actors[i]
        template = template.replace('{' + str(i) + '}', actor.full_name)
        template = re.sub(r'\[' + str(i) + r'+:([^|]+)\|([^]]+)\]',
                          r'\2' if actor.gender == 'female' else r'\1',
                          template)
    return template
