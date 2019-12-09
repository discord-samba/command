---
layout: 'guide'
title: 'Placeholder'
menuOrder: 1
redirect_from:
  - /guides/default
---


# Placeholder
This is a placeholder guide so I remember how to add guides when I actually start writing them

<discord-messages light>
	<discord-message role-color="#DEADBEEF" highlight>
		Foo bar baz! <discord-mention role-color="#DEADBEEF">test</discord-mention>
		<message-reactions>
			<message-reaction image="https://cdn.discordapp.com/emojis/359397580381224970.png?v=1" count="436"></message-reaction>
			<message-reaction image="https://canary.discordapp.com/assets/08c0a077780263f3df97613e58e71744.svg"></message-reaction>
			<message-reaction image="https://cdn.discordapp.com/emojis/585956382591680531.gif?v=1"></message-reaction>
		</message-reactions>
	</discord-message>
	<discord-message author="Pest" avatar="orange" edited bot>
		Wow!<br>
		Ooh!
		<message-reactions>
			<message-reaction image="https://cdn.discordapp.com/emojis/433059533653278757.gif?v=1"></message-reaction>
			<message-reaction image="https://cdn.discordapp.com/emojis/514139373315555349.png?v=1"></message-reaction>
		</message-reactions>
	</discord-message>
	<discord-message author="Codeblock" avatar="green">
		<pre>MessageReaction {
  message: [Object],
  me: true,
  count: 1,
  users: [Object],
  _emoji: [Object] }
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</pre>
	</discord-message>
	<discord-message author="zajrik" avatar="https://i.imgur.com/MSZsLzb.png">
		But what about boo far faz <discord-mention>User</discord-mention>?
		<discord-embed
			slot="embeds"
			color="#DEADBEEF"
			title="foo bar baz"
			image="https://i.imgur.com/MSZsLzb.png"
			thumbnail="https://i.imgur.com/MSZsLzb.png"
			author-name="zajrik"
			author-image="https://i.imgur.com/MSZsLzb.png"
			author-url="https://google.com"
			footer="foo bar baz"
			footer-image="https://i.imgur.com/MSZsLzb.png"
			timestamp="10/25/1990"
			>
			This is a really big description This is a really big description This is a really big description This is a really big description
			<embed-fields>
				<embed-field>foo bar regular field</embed-field>
				<embed-field inline>foo bar inline field</embed-field>
				<embed-field inline>boo bar inline field</embed-field>
				<embed-field inline>boo bar inline field</embed-field>
			</embed-fields>
		</discord-embed>
	</discord-message>
</discord-messages>