
class Predicate:
  def __init__(self, name, *args, stays=False, permanent=False):
    self.name = name
    self.args = args
    self.stays = stays
    self._permanent = permanent

  def keeping(self, *args):
    return self.using(*args, stays=True)

  def using(self, *args, stays=False, permanent=False):
    return self.instance(*args)

  def permanent(self, *args):
    return self.instance(*args, permanent=True)

  def instance(self, *args, stays=False, permanent=False):
    for my_arg, arg in zip(self.args, args):
      assert(arg.matches(my_arg))
    return Predicate(self.name, *args, stays=stays, permanent=permanent)

  def to_string(self):
    return (('!' if self._permanent else '') +
        ('$' if self.stays else '') +
        self.name + ' ' + ' '.join([a.name for a in self.args]))

class Rule:
  def __init__(self, name, lhs, rhs):
    self.name = name
    self.lhs = lhs
    self.rhs = rhs

  def to_string(self):
    return '{} :\n\t{}\n\t-o {}.'.format(self.name,
      ' * '.join([expr.to_string() for expr in self.lhs]),
      ' * '.join([expr.to_string() for expr in self.rhs]))

class Type:
  def __init__(self, name, parent=None):
    self.name = name
    self.parent = parent

  def matches(self, type):
    return self == type or (self.parent and self.parent.matches(type))

  def to_string(self):
    return self.name

class Template(Type):
  def __init__(self, name):
    self.name = name

  def matches(self, type):
    return True

T_TYPE = Type('type')
T_CHARACTER = Type('character', T_TYPE)
T_OBJECT = Type('object', T_TYPE)
T_MONEY = Type('money', T_OBJECT)
T_WEAPON = Type('weapon', T_OBJECT)

TEMPLATE1 = Template('C')
TEMPLATE2 = Template('C\'')
TEMPLATE3 = Template('C\'\'')

P_WANTS = Predicate('wants', T_CHARACTER, T_OBJECT)
P_HAS = Predicate('has', T_CHARACTER, T_OBJECT)
P_EXISTS_O = Predicate('existsO', T_OBJECT)
P_EXISTS_C = Predicate('existsC', T_CHARACTER)
P_AFFECTION = Predicate('affection', T_CHARACTER, T_CHARACTER)
P_MARRIED = Predicate('married',  T_CHARACTER, T_CHARACTER)
P_ANGER = Predicate('anger', T_CHARACTER, T_CHARACTER)
P_LOVERS = Predicate('lovers', T_CHARACTER, T_CHARACTER)
P_RELATED = Predicate('related', T_CHARACTER, T_CHARACTER)
P_NOT_RELATED = Predicate('not_related', T_CHARACTER, T_CHARACTER)
P_SAD = Predicate('sad', T_CHARACTER)
P_MAD = Predicate('mad', T_CHARACTER)
P_DEAD = Predicate('dead', T_CHARACTER)

Rule('steal_caught',
    [P_WANTS.keeping(TEMPLATE1, T_MONEY), P_HAS.keeping(TEMPLATE2, T_MONEY)],
    [P_ANGER.using(TEMPLATE1, TEMPLATE2)] * 3)

Rule('murder_anger',
    [P_HAS.keeping(TEMPLATE1, T_WEAPON)] + [P_ANGER.using(TEMPLATE1, TEMPLATE2)] * 3,
    [P_DEAD.permanent(TEMPLATE2)])

Rule('make_up',
    [P_ANGER.using(TEMPLATE1, TEMPLATE2)] * 2 + [P_AFFECTION.using(TEMPLATE1, TEMPLATE2)],
    [])

Rule('get_married_for_love',
    [P_AFFECTION.keeping(TEMPLATE1, TEMPLATE2)] * 3 + [P_AFFECTION.keeping(TEMPLATE2, TEMPLATE1)] * 3 + [P_NOT_RELATED.keeping(TEMPLATE1, TEMPLATE2), P_NOT_RELATED.keeping(TEMPLATE2, TEMPLATE1)],
    [P_MARRIED.using(TEMPLATE1, TEMPLATE2)])

print(r.to_string())

