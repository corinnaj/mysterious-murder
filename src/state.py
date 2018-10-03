
class State:
    def __init__(self, init_state_list=None):
        self.dict = {}
        if init_state_list:
            self.append_all(init_state_list)

    def copy(self):
        s = State()
        s.dict = dict.copy()
        return s

    def hash_predicate(self, predicate):
        return self.hash(predicate.name, predicate.actors)

    def hash(self, name, actors):
        h = hash(name)
        for actor in actors:
            h ^= hash(actor)
        return h

    def append_all(self, predicate_list):
        for predicate in predicate_list:
            self.append(predicate)

    def append(self, predicate):
        h = self.hash_predicate(predicate)
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
        self.dict[self.hash_predicate(predicate)].remove(predicate)

    def fetch(self, name, actors):
        """returns the list of resources matching the given description"""
        list = self.dict.get(self.hash(name, actors))
        if not list:
            return []
        return list

    def contains(self, name, actors):
        list = self.fetch(name, actors)
        return list is not None and len(list) > 0

    def count(self, name, actors):
        return len(self.dict.get(self.hash(name, actors)))

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
        self.taken = []
        self.state = state

    def fetch(self, name, actors):
        list = self.state.fetch(name, actors)
        for instance in list:
            if id(instance) not in self.taken:
                self.taken.append(id(instance))
                return instance
        return None

    def reset(self):
        self.taken = []
