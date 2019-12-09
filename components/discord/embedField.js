customElements.define('embed-field', class extends HTMLElement
{
	get title()
	{
		if (!this.hasAttribute('title'))
			return 'Field Title';

		return this.getAttribute('title');
	}

	get inline()
	{
		return this.hasAttribute('inline');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordEmbedFieldTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordEmbedFieldTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host-context(.discord-embed):host(.discord-embed-field) {
				min-width: 100%;
				margin-top: 5px;
			}

			:host-context(.discord-embed):host(.discord-embed-field.discord-inline-field) {
				flex-grow: 1;
				flex-basis: auto;
				min-width: 140px;
			}

			:host-context(.discord-embed):host(.discord-embed-field) .discord-field-title {
				color: #72767d;
				font-weight: 500;
				margin-bottom: 2px;
			}

			:host-context(.discord-light-theme):host-context(.discord-embed):host(.discord-embed-field) .discord-field-title {
				color: #747f8d;
			}
		</style>
	`;

	this.classList.add('discord-embed-field');
	if (this.inline)
		this.classList.add('discord-inline-field');

	// <div class="discord-field-title">
	const fieldTitleDiv = document.createElement('div');
	{
		fieldTitleDiv.classList.add('discord-field-title');
		fieldTitleDiv.innerText = this.title;
	}
	shadow.appendChild(fieldTitleDiv);
	// </div>

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}
