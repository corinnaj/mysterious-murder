import copy


def hash_predicate(predicate):
    return hash_name_actors(predicate.name, predicate.actors)


def hash_name_actors(name, actors):
    return hash(name) ^ hash(tuple(actors))


class State:
    def __init__(self, init_state_list=None):
        self.dict = {}
        if init_state_list:
            self.append_all(init_state_list)

    def copy(self):
        s = State()
        s.dict = {key: copy.copy(l) for key, l in self.dict.items()}
        return s

    def append_all(self, predicate_list):
        for predicate in predicate_list:
            self.append(predicate)

    def append(self, predicate):
        h = predicate._hash
        list = self.dict.get(h)
        if not list:
            list = self.dict[h] = []
        list.append(predicate)

    def flatten(self):
        list = []
        for key in self.dict:
            for pred in self.dict[key]:
                list.append(pred)
        return list

    def remove(self, predicate):
        self.dict[hash_predicate(predicate)].remove(predicate)

    def fetch(self, name, actors):
        """returns the list of resources matching the given description"""
        return self.fetch_hash(hash_name_actors(name, actors))

    def fetch_hash(self, hash):
        return self.dict.get(hash, [])

    def contains(self, name, actors):
        list = self.fetch(name, actors)
        return list is not None and len(list) > 0

    def count(self, name, actors):
        return len(self.dict.get(hash_name_actors(name, actors)))

    def all_predicates_from(self, actor):
        return self.all_predicates_matching(lambda pred:
                                            pred.actors[0] == actor)

    def all_predicates_from_to(self, actor, other):
        return self.all_predicates_matching(lambda pred:
                                            len(pred.actors) == 2 and
                                            pred.actors[0] == actor and
                                            pred.actors[1] == other)

    def all_predicates_matching(self, test):
        list = []
        for hash, preds in self.dict.items():
            for pred in preds:
                if test(pred):
                    list.append(pred)
        return list

    def __len__(self):
        return sum(len(list) for key, list in self.dict.items())


class StateAccess:
    """
    encapsulates access to the state while trying to form a ruleinstance by
    keeping track of resources that were already used
    """

    def __init__(self, state):
        self.taken = set()
        self.state = state

    def fetch_hash(self, h):
        return self.unused_from_list(self.state.fetch_hash(h))

    def fetch(self, name, actors):
        return self.unused_from_list(self.state.fetch(name, actors))

    def unused_from_list(self, list):
        for instance in list:
            i = id(instance)
            if i not in self.taken:
                self.taken.add(i)
                return instance
        return None

    def reset(self):
        self.taken.clear()
