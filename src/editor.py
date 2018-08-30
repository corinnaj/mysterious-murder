import os
os.environ['KIVY_METRICS_DENSITY'] = '2'

from kivy.app import App
from kivy.uix.accordion import Accordion, AccordionItem
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.textinput import TextInput
from kivy.core.window import Window

Window.clearcolor = (1, 1, 1, 1)


class Rule(BoxLayout):
    def on_enter(self, value):
        print(value)

    def __init__(self):
        super(Rule, self).__init__(spacing=24, padding=24)
        self.add_predicate()
        self.add_predicate()
        self.add_predicate()
        self.add_widget(Label(text='-o', color=(0, 0, 0, 1), size_hint=(None, 1)))
        self.add_predicate()

    def add_predicate(self):
        textinput = TextInput(multiline=False, background_normal='')
        textinput.bind(on_text_validate=self.on_enter)
        self.add_widget(textinput)


class MainApp(App):
    def add_rule(self):
        item = AccordionItem(title='Title')
        item.add_widget(Rule())
        self.accordion.add_widget(item)

    def build(self):
        root = BoxLayout(orientation='vertical')
        self.accordion = Accordion(orientation='vertical')
        root.add_widget(self.accordion)
        self.add_rule()
        return root


if __name__ == '__main__':
    MainApp().run()
