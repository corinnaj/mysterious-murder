from graphviz import Digraph


class GraphPrinter:
    def __init__(self, evaluator, view=False, show_all=False):
        color_inc = 1 / len(evaluator.actors)
        self.actor_colors = {evaluator.actors[i]:
                             '{} s 1.0'.format(str(color_inc * i))
                             for i in range(len(evaluator.actors))}

        self.dot = Digraph(format='svg', engine='dot')
        self.existing_rules = set()
        self.print_instances(evaluator.init_state, show_all=show_all)
        self.dot.render('output', view=view)

    def color_list(self, list, saturation):
        return ':'.join([self.actor_colors[actor].replace('s', str(saturation))
                         for actor in list])

    def print_instances(self, instances, parent=None, show_all=False):
        for instance in instances:
            if instance.consumed_by or show_all:
                self.dot.attr('node',
                              style='striped',
                              fillcolor=self.color_list(instance.actors, 0.1),
                              shape='box')
                self.dot.node(instance.id, str(instance))
                if parent:
                    self.dot.edge(parent.id, instance.id)

        for instance in instances:
            if instance.consumed_by:
                if instance.consumed_by.id not in self.existing_rules:
                    self.print_rule(instance.consumed_by, show_all=show_all)
                self.dot.edge(instance.id, instance.consumed_by.id)

    def print_rule(self, rule, show_all=False):
        self.existing_rules.add(rule.id)
        self.dot.attr('node',
                      style='striped',
                      shape='box',
                      fillcolor=self.color_list(rule.actors, 0.4))
        self.dot.node(rule.id, str(rule))
        self.print_instances(rule.produced, rule, show_all=show_all)
