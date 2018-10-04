from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.image import Image
from kivy.uix.button import Button
from kivy.uix.togglebutton import ToggleButton

import random
import os
import glob
from .murder_mystery import rules, Simulation, Evaluator, create_characters

selected = []
colors = [[0, 0, 1, 1], [0, 0.25, 0.75, 1], [0, 0.5, 0.5, 1], [0.5, 0.5, 0, 1]]
images = BoxLayout(orientation='horizontal')


def get_filename_for(emoji):
    image = hex(ord(emoji))
    image = 'assets/emoji_u' + str(image)[2:] + '*.png'
    files = [f for f in glob.glob(image) if os.path.isfile(f)]
    return random.choice(files)


def get_char_images(c):
    folder = 'assets/portraits/' + c.gender + '/'
    return random.choice(os.listdir(folder))


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
                selected.append(c)
                instance.background_color = colors[selected.index(c)]
            else:
                instance.background_color = [0.8, 0.8, 0.8, 1]
                instance.text = "Select"
                selected.remove(c)
            app.update()

        btn = ToggleButton(text="Select")
        btn.bind(state=callback)
        layout = GridLayout(cols=2)
        layout.add_widget(Label(text="Name", bold=True))
        layout.add_widget(Label(text=c.full_name))

        img = 'assets/portraits/' + c.gender + '/' + get_char_images(c)
        if c.dead(s.evaluator.state):
            print('dead')
            self.add_widget(Image(source='assets/emoji_u274c.png'))
        self.add_widget(Image(source=img))
        self.add_widget(layout)
        self.add_widget(btn)


class SingleCharWidget(BoxLayout):

    def __init__(self, **kwargs):
        super(SingleCharWidget, self).__init__(**kwargs)

        def ask_char(instance):
            pass

        def ask_weapon(instance):
            emojis = selected[0].has_weapon(s.evaluator.state)
            display(emojis)

        def ask_mood(instance):
            emojis = selected[0].mood(s.evaluator.state)
            display(emojis)

        char_button = Button(text="Character Traits")
        char_button.bind(on_press=ask_char)
        self.add_widget(char_button)

        weapon_button = Button(text="Possessions")
        weapon_button.bind(on_press=ask_weapon)
        self.add_widget(weapon_button)

        mood_button = Button(text="Current Mood")
        mood_button.bind(on_press=ask_mood)
        self.add_widget(mood_button)


class DoubleCharWidget(BoxLayout):

    def __init__(self, **kwargs):
        super(DoubleCharWidget, self).__init__(**kwargs)

        def ask_rel(instance):
            emojis = selected[0].relationship_to(selected[1], s.evaluator.state)
            display(emojis)

        def ask_feels(instance):
            emojis = selected[0].feelings_towards(selected[1], s.evaluator.state)
            display(emojis)

        char_button = Button(text="Relationship")
        char_button.bind(on_press=ask_rel)
        self.add_widget(char_button)

        feelings_button = Button(text="Feelings")
        feelings_button.bind(on_press=ask_feels)
        self.add_widget(feelings_button)


class MurderMysteryApp(App):

    main_layout = BoxLayout(orientation="vertical")
    singleWidget = SingleCharWidget(orientation="vertical", opacity=0)
    doubleWidget = DoubleCharWidget(orientation="vertical", opacity=0)
    lastNum = 0

    def build(self):
        profile_layout = BoxLayout()
        for c in characters:
            profile = ProfileWidget(c, self, orientation="vertical")
            profile_layout.add_widget(profile)

        self.main_layout.add_widget(profile_layout)
        self.main_layout.add_widget(Label(text="Ask about: ", bold=True, font_size=30))
        self.main_layout.add_widget(self.singleWidget)
        self.main_layout.add_widget(self.doubleWidget)
        self.main_layout.add_widget(images)

        return self.main_layout

    def update(self):
        if self.lastNum == len(selected):
            pass
        self.lastNum = len(selected)
        self.singleWidget.opacity = 0
        self.doubleWidget.opacity = 0
        if self.lastNum == 1:
            self.singleWidget.opacity = 1
        elif self.lastNum == 2:
            self.doubleWidget.opacity = 1


if __name__ == '__main__':
    characters, state = create_characters(4)
    s = Simulation(Evaluator(rules=rules, actors=characters, state=state))
    s.evaluator.verify_integrity()
    s.run(interactive=False, max_steps=10)

    MurderMysteryApp().run()
