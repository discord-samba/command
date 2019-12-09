let __discordMessageID = 0;
const __documentScripts = document.getElementsByTagName('script');
const __discordMessageComponentScriptLocation = __documentScripts[__documentScripts.length - 1].src
	.match(/(.+)\/[^\/]+\.js$/)[1];

customElements.define('discord-message', class extends HTMLElement
{
	constructor()
	{
		super();
		this.messageID = __discordMessageID += 1;
	}

	get compact()
	{
		return this.parentElement.hasAttribute('compact');
	}

	get bot()
	{
		return this.hasAttribute('bot');
	}

	get author()
	{
		if (!this.hasAttribute('author'))
			return 'User';

		return this.getAttribute('author');
	}

	get avatar()
	{
		if (!this.hasAttribute('avatar'))
			return `${__discordMessageComponentScriptLocation}/avatars/blue.png`;

		const avatar = this.getAttribute('avatar');
		if (['blue', 'gray', 'green', 'orange', 'red'].includes(avatar))
			return `${__discordMessageComponentScriptLocation}/avatars/${avatar}.png`;

		return this.getAttribute('avatar');
	}

	get roleColor()
	{
		if (!this.hasAttribute('role-color'))
			return;

		return this.getAttribute('role-color');
	}

	get highlight()
	{
		return this.hasAttribute('highlight');
	}

	get edited()
	{
		return this.hasAttribute('edited');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordMessageTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMessageTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });
	shadow.innerHTML = `
		<style>
			:host(.discord-message) {
				display: flex;
				font-size: 0.9em;
				padding: 1em 0.5em;
				border-bottom: 1px solid rgba(255, 255, 255, 0.05);
			}

			:host-context(.discord-light-theme):host(.discord-message) {
				border-color: #eceeef;
			}

			:host-context(.discord-light-theme):host(.discord-message) .discord-message-body {
				color: #2e3338;
			}

			:host(.discord-message:last-of-type) {
				border-bottom-width: 0;
			}

			:host(.discord-message) a {
				color: #0096cf;
				font-weight: normal;
				text-decoration: none;
			}

			:host(.discord-message) a:hover {
				text-decoration: underline;
			}

			:host(.discord-light-theme):host(.discord-message) a {
				color: #00b0f4;
			}

			:host(.discord-message) a:hover {
				text-decoration: underline;
			}

			:host(.discord-message) .discord-author-avatar {
				margin-top: 1px;
				margin-right: 16px;
				min-width: 40px;
			}

			:host(.discord-message) .discord-author-avatar img {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				cursor: pointer;
			}

			:host(.discord-message) .discord-author-avatar img:hover {
				opacity: 0.75;
			}

			:host(.discord-message) .discord-message-timestamp {
				color: #fff3;
				font-size: 12px;
				margin-left: 3px;
			}

			:host(.discord-message) .discord-message-edited {
				color: #fff3;
				font-size: 10px;
			}

			:host-context(.discord-light-theme):host(.discord-message) .discord-message-edited {
				color: #99aab5;
			}

			:host(.discord-message) .discord-message-content {
				width: 100%;
				line-height: 150%;
			}

			:host(.discord-message) .discord-message-body {
				position: relative;
				font-weight: 300;
			}

			:host-context(.discord-light-theme):host(.discord-message) .discord-message-body {
				font-weight: 400;
			}

			:host-context(.discord-compact-mode):host(.discord-message) .discord-message-timestamp {
				color: #72767d;
			}

			:host-context(.discord-light-theme):host(.discord-message) .discord-message-timestamp,
			:host-context(.discord-compact-mode):host-context(.discord-light-theme):host(.discord-message) .discord-message-timestamp {
				color: #747f8d;
			}

			:host-context(.discord-compact-mode):host(.discord-message) {
				padding-top: 0.5em;
				padding-bottom: 0.5em;
			}

			:host-context(.discord-compact-mode) .discord-author-avatar {
				display: none;
			}

			:host-context(.discord-compact-mode) .discord-message-body {
				margin-left: 0.25em;
			}

			:host-context(.discord-message) .discord-message-body.discord-highlight-mention {
				background-color: rgba(250, 166, 26, 0.1);
				border-radius: 0 3px 3px 0;
				margin-left: -3px;
				padding-left: 3px;
				padding-right: 5px;
			}

			:host-context(.discord-message) .discord-message-body.discord-highlight-mention::before {
				content: " ";
				background-color: rgba(250, 166, 26, 0.2);
				position: absolute;
				top: 0;
				left: -6px;
				bottom: 0;
				width: 2px;
				border-left: 4px solid #faa61a;
				border-radius: 3px 0 0 3px;
			}

			:host(.discord-message) .discord-message-body.discord-highlight-mention .discord-mention:hover {
				color: #7289da;
				text-decoration: underline;
			}

			:host(.discord-message) ::slotted(pre) {
				max-width: calc(100% - 80px);
				padding: 0.5em !important;
				border-radius: 4px;
				border: 1px solid #202225;
				background-color: #2f3136 !important;
				white-space: pre-wrap;
				word-wrap: break-word;
				line-height: 1.125rem;
				color: #b9bbbe;
				font-size: 14px !important;
				font-family: Consolas,monospace !important;
			}

			:host-context(.discord-light-theme):host(.discord-message) ::slotted(pre) {
				border: 1px solid #e3e5e8;
				background-color: #f2f3f5 !important;
				color: #4f5660;
			}
		</style>
	`

	this.classList.add('discord-message');
	if (this.compact)
		this.classList.add('discord-compact-mode');
	
	// <div class="discord-author-avatar">
	const avatarDiv = document.createElement('div');
	{
		avatarDiv.classList.add('discord-author-avatar');

		const avatarImg = document.createElement('img');
		avatarImg.src = this.avatar;
		avatarImg.alt = this.author;

		avatarDiv.appendChild(avatarImg);
	}
	shadow.appendChild(avatarDiv);
	// </div>
	
	// <div class="discord-message-content">
	const contentDiv = document.createElement('div');
	{
		contentDiv.classList.add('discord-message-content');

		// Append non-compact author-info if not in compact mode
		if (!this.compact)
		{
			// <div>
			const authorInfoDiv = document.createElement('div');
			{
				// <author-info>
				const authorInfo = document.createElement('author-info');
				{
					if (this.bot)
						authorInfo.setAttribute('bot', this.bot);

					if (typeof this.roleColor !== 'undefined')
						authorInfo.setAttribute('role-color', this.roleColor);

					authorInfo.innerText = this.author;
				}
				authorInfoDiv.appendChild(authorInfo);
				// </author-info>

				// <span class="discord-message-timestamp">
				const timestampSpan = document.createElement('span');
				{
					timestampSpan.classList.add('discord-message-timestamp');
					const date = new Date();
					const dateHours = date.getHours();

					const rawHour = dateHours > 12
						? dateHours - 12
						: dateHours === 0
							? 12
							: dateHours;

					const hour = rawHour.toString().padStart(2, 0);
					const minute = date.getMinutes().toString().padStart(2, 0);
					const amPm = dateHours < 12 ? 'AM' : 'PM';

					timestampSpan.innerText = `Today at ${hour}:${minute} ${amPm}`;
				}
				authorInfoDiv.appendChild(timestampSpan);
				// </span>

			}
			contentDiv.appendChild(authorInfoDiv);
			// </div>
		}

		// <div class="discord-message-body">
		const messageBodyDiv = document.createElement('div');
		{
			messageBodyDiv.classList.add('discord-message-body');

			// Add highlight class if this message is mention-highlighted
			if (this.highlight)
				messageBodyDiv.classList.add('discord-highlight-mention');

			// Append compact author-info if in compact mode
			if (this.compact)
			{
				// <span class="discord-message-timestamp">
				const timestampSpan = document.createElement('span');
				{
					timestampSpan.classList.add('discord-message-timestamp');
					const date = new Date();
					const dateHours = date.getHours();

					const rawHour = dateHours > 12
						? dateHours - 12
						: dateHours === 0
							? 12
							: dateHours;

					const hour = rawHour.toString().padStart(2, 0);
					const minute = date.getMinutes().toString().padStart(2, 0);
					const amPm = dateHours < 12 ? 'AM' : 'PM';

					timestampSpan.innerText = `${hour}:${minute} ${amPm}`;
				}
				messageBodyDiv.appendChild(timestampSpan);
				// </span>

				// <author-info>
				const authorInfo = document.createElement('author-info');
				{
					if (this.bot)
						authorInfo.setAttribute('bot', this.bot);

					if (typeof this.roleColor !== 'undefined')
						authorInfo.setAttribute('role-color', this.roleColor);

					authorInfo.innerText = this.author;
				}
				messageBodyDiv.appendChild(authorInfo);
				// </author-info>
			}

			// <slot>
			const slot = document.createElement('slot');
			messageBodyDiv.appendChild(slot);
			// </slot>

			// Add edited indicator if message is marked as edited
			if (this.edited)
			{
				// <span class="discord-message-edited">
				const editedSpan = document.createElement('span');
				{
					editedSpan.classList.add('discord-message-edited');
					editedSpan.innerText = '(edited)';
				}
				messageBodyDiv.appendChild(editedSpan);
				// </span>
			}
		}
		contentDiv.appendChild(messageBodyDiv);
		// </div>

		// <slot name="embeds">
		const embedsSlot = document.createElement('slot');
		{
			embedsSlot.setAttribute('name', 'embeds');
		}
		contentDiv.appendChild(embedsSlot);
		// </slot>

		// <slot name="reactions">
		const reactionsSlot = document.createElement('slot');
		{
			reactionsSlot.setAttribute('name', 'reactions');
		}
		contentDiv.appendChild(reactionsSlot);
		// </slot>
	}
	shadow.appendChild(contentDiv);
	// </div>
}
