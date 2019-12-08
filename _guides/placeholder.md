---
layout: 'guide'
title: 'Placeholder'
menuOrder: 1
redirect_from:
  - /guides/default
---


# Placeholder
This is a placeholder guide so I remember how to add guides when I actually start writing them

{% include discord/mod %}

<discord-messages light>
	<discord-message role-color="#DEADBEEF" highlight>
		Foo bar baz! <discord-mention role-color="#DEADBEEF">test</discord-mention>
	</discord-message>
	<discord-message author="Pest" avatar="orange" edited bot>
		Wow!<br>
		Ooh!
	</discord-message>
	<discord-message author="zajrik" avatar="https://i.imgur.com/MSZsLzb.png">
		But what about boo far faz?
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