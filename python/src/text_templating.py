import re


def apply(template, actors, short=False):
    for i in range(len(actors)):
        actor = actors[i]
        template = template.replace('{' + str(i) + '}',
                                    actor.portrait if short else actor.full_name)
        template = re.sub(r'\[' + str(i) + r'+:([^|]+)\|([^]]+)\]',
                          r'\2' if actor.gender == 'female' else r'\1',
                          template)
    return template
