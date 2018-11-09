from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.image import Image
from kivy.uix.button import Button
from kivy.uix.togglebutton import ToggleButton

from .agent import MCTSAgent
from .murder_mystery import rules, Simulation, Evaluator, create_characters
from .text_templating import apply as template_apply
from .emoji import get_filename_for

colors = [[0, 0, 1, 1], [0, 0.25, 0.75, 1], [0, 0.5, 0.5, 1], [0.5, 0.5, 0, 1]]
images = BoxLayout(orientation='horizontal')


def display(emojis):
    images.clear_widgets()
    for e in emojis:
        if not e:
            continue
        file = get_filename_for(e)
        images.add_widget(Image(source=file))


class ProfileWidget(BoxLayout):

    def __init__(self, c, app, **kwargs):
        super(ProfileWidget, self).__init__(**kwargs)

        def callback(instance, value):
            if value == "down":
                instance.text = "Selected"
                app.selected.append(c)
                instance.background_color = colors[app.selected.index(c)]
            else:
                instance.background_color = [0.8, 0.8, 0.8, 1]
                instance.text = "Select"
                app.selected.remove(c)
            app.update()

        btn = ToggleButton(text="Select")
        btn.bind(state=callback)
        # layout = GridLayout(cols=2)
        # layout.add_widget(Label(text="Name", bold=True))
        # layout.add_widget(Label(text=c.full_name))

        PORTRAIT_SIZE = 100

        img = get_filename_for(c.portrait)
        if c.dead(app.simulation.evaluator.state):
            stack = RelativeLayout(height=PORTRAIT_SIZE, size_hint=(1, None))
            stack.add_widget(Image(source=img))
            stack.add_widget(Image(source='assets/emoji_u274c.png'))
            self.add_widget(stack)
        else:
            self.add_widget(Image(source=img, height=PORTRAIT_SIZE, size_hint=(1, None)))
        self.add_widget(Label(text=c.full_name, bold=True))
        self.add_widget(btn)


class SingleCharWidget(BoxLayout):

    def __init__(self, app, **kwargs):
        super(SingleCharWidget, self).__init__(**kwargs)

        def ask_char(instance):
            pass

        def ask_weapon(instance):
            emojis = app.selected[0].has_weapon(app.simulation.evaluator.state)
            display(emojis)

        def ask_mood(instance):
            emojis = app.selected[0].mood(app.simulation.evaluator.state)
            display(emojis)

        def accuse(instance):
            app.accuse(app.selected[0])

#        char_button = Button(text="Character Traits")
#        char_button.bind(on_press=ask_char)
#        self.add_widget(char_button)

        weapon_button = Button(text="Possessions")
        weapon_button.bind(on_press=ask_weapon)
        self.add_widget(weapon_button)

        mood_button = Button(text="Current Mood")
        mood_button.bind(on_press=ask_mood)
        self.add_widget(mood_button)

        accuse_button = Button(text="Accuse", background_color=[1, 0, 0, 1])
        accuse_button.bind(on_press=accuse)
        self.add_widget(accuse_button)


class DoubleCharWidget(BoxLayout):

    def __init__(self, app, **kwargs):
        super(DoubleCharWidget, self).__init__(**kwargs)

        def ask_rel(instance):
            emojis = app.selected[0].relationship_to(app.selected[1], app.simulation.evaluator.state)
            display(emojis)

        def ask_feels(instance):
            emojis = app.selected[0].feelings_towards(app.selected[1], app.simulation.evaluator.state)
            display(emojis)

        def ask_facts(instance):
            emojis = app.selected[0].witnessed_for_character(app.selected[1])
            display(emojis)

        char_button = Button(text="Relationship")
        char_button.bind(on_press=ask_rel)
        self.add_widget(char_button)

        feelings_button = Button(text="Feelings")
        feelings_button.bind(on_press=ask_feels)
        self.add_widget(feelings_button)

        facts_button = Button(text="Facts")
        facts_button.bind(on_press=ask_facts)
        self.add_widget(facts_button)


class MurderMysteryApp(App):

    def __init__(self, **kwargs):
        super(MurderMysteryApp, self).__init__(**kwargs)
        self.main_layout = BoxLayout(orientation="vertical")
        self.ask_label = Label(text="", bold=True, font_size=30)
        self.redo()

    def build(self):
        return self.main_layout

    def update(self):
        if self.lastNum == len(self.selected):
            pass
        self.lastNum = len(self.selected)
        self.main_layout.remove_widget(self.singleWidget)
        self.main_layout.remove_widget(self.doubleWidget)

        if self.lastNum == 0:
            self.ask_label.text = "Select a character to ask them questions"
        elif self.lastNum == 1:
            self.main_layout.add_widget(self.singleWidget, index=1)
            self.ask_label.text = "Ask " + self.selected[0].first_name + ":"
        elif self.lastNum == 2:
            self.main_layout.add_widget(self.doubleWidget, index=1)
            self.ask_label.text = "Ask " + self.selected[0].first_name + " about " + self.selected[1].first_name + ":"

    def accuse(self, character):
        self.main_layout.remove_widget(self.singleWidget)
        self.main_layout.remove_widget(self.doubleWidget)
        self.main_layout.remove_widget(images)
        self.ask_label.text = ""
        self.main_layout.add_widget(Label(text="You confront " + character.full_name + '.', font_size=30))
        if self.simulation.check_is_murderer(character):
            self.main_layout.add_widget(Label(text=template_apply('[0:He|She] confesses immediatly!', [character]), font_size=30))
        else:
            self.main_layout.add_widget(Label(text="You got the wrong person!\nIt was actually " + self.simulation.get_murderers()[0].full_name + '!', font_size=30))

        # self.simulation.print_murder_causality()

        def do_redo(instance):
            self.redo()
        redo_button = Button(text="Play again")
        redo_button.bind(on_press=do_redo)
        self.main_layout.add_widget(redo_button)

    def open_graph(self):
        self.simulation.print_graph(view=True, show_all=False)

    def redo(self):
        self.selected = []
        self.main_layout.clear_widgets()
        self.ask_label.text = "Select a character to start asking them questions"

        characters, state = create_characters(4)
        self.simulation = Simulation(Evaluator(rules=rules,
                                               actors=characters,
                                               state=state),
                                     agent=MCTSAgent(),
                                     log=False)
        self.simulation.evaluator.verify_integrity()
        self.simulation.run(interactive=False, max_steps=100)

        self.lastNum = 0
        self.singleWidget = SingleCharWidget(self, orientation="vertical")
        self.doubleWidget = DoubleCharWidget(self, orientation="vertical")

        profile_layout = BoxLayout()
        for c in self.simulation.evaluator.actors:
            profile = ProfileWidget(c, self, orientation="vertical")
            profile_layout.add_widget(profile)

        self.main_layout.add_widget(profile_layout)
        self.main_layout.add_widget(self.ask_label)
        self.main_layout.add_widget(images)


def run_forever():
    try:
        MurderMysteryApp().run()
    except Exception as e:
        if e is KeyboardInterrupt:
            return
        else:
            print(e)
            run_forever()


if __name__ == '__main__':
    run_forever()
