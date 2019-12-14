customElements.define('discord-mention', class extends HTMLElement
{
	get lightTheme()
	{
		console.log(this.parentNode.parentNode.hasAttribute('light'));
		return this.parentNode.parentNode.hasAttribute('light');
	}

	get highlight()
	{
		return this.parentNode.hasAttribute('highlight');
	}

	get char()
	{
		if (this.hasAttribute('channel'))
			return '#';

		return '@';
	}

	get roleColor()
	{
		if (this.hasAttribute('channel') || !this.hasAttribute('role-color'))
			return;

		return this.getAttribute('role-color');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;


		discordMentionTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMentionTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-mention) slot:before {
				content: "${this.char}"
			}
			
			:host(.discord-mention) {
				color: #7289da;
				background-color: #3c414f;
				font-weight: 500;
				padding: 0 1px;
				cursor: pointer;
			}

			:host(.discord-light-theme):host(.discord-mention) {
				background-color: #f1f3fb;
			}

			:host(.discord-mention:hover) {
				color: #fff;
				background-color: #6071ac;
			}

			:host(.discord-light-theme):host(.discord-mention:hover) {
				background-color: #7289da;
			}

			:host(.message-highlight):host(.discord-mention:hover) {
				color: #7289da;
			}

			:host(.message-highlight):host(.discord-mention) {
				background-color: unset !important;
			}

			:host(.message-highlight):host(.discord-mention:hover) {
				text-decoration: underline;
			}
		</style>
	`;

	const colorRegex = /rgba?\((\d+), (\d+), (\d+)(?:, .+)\)/;

	/**
	 * @param {string} color
	 * @param {number} alpha
	 */
	function bgColor(color, alpha)
	{
		const colors = color.match(colorRegex);
		return `rgba(${colors[1]}, ${colors[2]}, ${colors[3]}, ${alpha})`;
	}

	this.classList.add('discord-mention');

	if (this.lightTheme)
		this.classList.add('discord-light-theme');

	if (this.highlight)
		this.classList.add('message-highlight');

	if (typeof this.roleColor !== 'undefined')
	{
		this.style.color = this.roleColor;
		this.style.backgroundColor = bgColor(this.style.color);

		this.onmouseover = () =>
		{
			if (!this.parentElement.hasAttribute('highlight'))
				this.style.backgroundColor = bgColor(this.style.color, 0.3);
		};

		this.onmouseout = () =>
		{
			if (!this.parentElement.hasAttribute('highlight'))
				this.style.backgroundColor = bgColor(this.style.color, 0.1);
		};
	}

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}
