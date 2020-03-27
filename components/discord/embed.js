customElements.define('discord-embed', class extends HTMLElement
{
	get lightTheme()
	{
		return this.parentNode.parentNode.hasAttribute('light');
	}
	
	get compact()
	{
		return this.parentNode.parentNode.hasAttribute('compact');
	}

	get authorName()
	{
		if (!this.hasAttribute('author-name'))
			return;

		return this.getAttribute('author-name');
	}

	get authorImage()
	{
		if(!this.hasAttribute('author-image'))
			return;

		return this.getAttribute('author-image');
	}

	get authorUrl()
	{
		if (!this.hasAttribute('author-url'))
			return;

		return this.getAttribute('author-url');
	}

	get color()
	{
		if (!this.hasAttribute('color'))
			return;

		return this.getAttribute('color');
	}

	get title()
	{
		if (!this.hasAttribute('title'))
			return;

		return this.getAttribute('title');
	}

	get url()
	{
		if (!this.hasAttribute('url'))
			return;

		return this.getAttribute('url');
	}

	get thumbnail()
	{
		if (!this.hasAttribute('thumbnail'))
			return;

		return this.getAttribute('thumbnail');
	}

	get image()
	{
		if (!this.hasAttribute('image'))
			return;

		return this.getAttribute('image');
	}

	get timestamp()
	{
		if (!this.hasAttribute('timestamp'))
			return;

		return this.getAttribute('timestamp');
	}

	get footerText()
	{
		if (!this.hasAttribute('footer'))
			return;

		return this.getAttribute('footer');
	}

	get footerImage()
	{
		if (!this.hasAttribute('footer-image'))
			return;

		return this.getAttribute('footer-image');
	}

	get showFooter()
	{
		return this.hasAttribute('footer') || this.hasAttribute('timestamp');
	}

	get showFooterImage()
	{
		return this.hasAttribute('footer') && this.hasAttribute('footer-image');
	}

	get showFooterSeparator()
	{
		return this.hasAttribute('footer') && this.hasAttribute('timestamp');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordEmbedTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordEmbedTemplate(char, roleColor)
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-embed) {
				color: #dcddde;
				display: flex;
				margin-top: 8px;
				margin-bottom: 8px;
				font-size: 13px;
				line-height: 150%;
			}

			:host(.discord-light-theme):host(.discord-embed) {
				color: #2e3338;
			}

			:host(.discord-embed) .discord-left-border {
				background-color: #202225;
				flex-shrink: 0;
				width: 4px;
				border-radius: 4px 0 0 4px;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-left-border {
				background-color: #e3e5e8;
			}

			:host(.discord-embed) .discord-embed-container {
				background-color: #2f3136;
				display: flex;
				flex-direction: column;
				max-width: 520px;
				padding: 8px 16px 8px;
				border: 1px solid rgba(46, 48, 54, 0.6);
				border-radius: 0 4px 4px 0;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-embed-container {
				background-color: rgba(249, 249, 249, 0.3);
				border-color: rgba(205, 205, 205, 0.3);
			}

			:host(.discord-embed) .discord-embed-content {
				display: flex;
			}

			:host(.discord-embed) .discord-embed-thumbnail {
				max-width: 80px;
				max-height: 80px;
				margin-left: 16px;
				margin-top: 8px;
				border-radius: 4px;
				object-fit: contain;
				object-position: top center;
			}

			:host(.discord-embed) .discord-embed-author {
				color: #fff;
				display: flex;
				align-items: center;
				font-weight: 500;
				margin-top: 8px;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-embed-author {
				color: #4f545c;
			}
			:host(.discord-embed) .discord-embed-author a {
				color: #fff;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-embed-author a {
				color: #4f545c;
			}

			:host(.discord-embed) .discord-embed-author .discord-author-image {
				width: 24px;
				height: 24px;
				margin-right: 8px;
				border-radius: 50%;
			}

			:host(.discord-embed) .discord-embed-title {
				color: #fff;
				font-size: 16px;
				font-weight: 600;
				margin-top: 8px;
			}

			:host(.discord-embed) .discord-embed-title a {
				color: #00b0f4;
				font-weight: 600;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-embed-title {
				color: #747f8d;
			}

			:host(.discord-embed) .discord-embed-description {
				margin-top: 8px;
			}

			:host(.discord-embed) .discord-embed-image {
				max-width: 100%;
				margin-top: 16px;
				border-radius: 4px;
			}

			:host(.discord-embed) .discord-embed-footer {
				color: #72767d;
				display: flex;
				align-items: center;
				font-size: 0.85em;
				margin-top: 8px;
				line-height: 80%;
			}

			:host(.discord-embed) .discord-embed-footer .discord-footer-image {
				flex-shrink: 0;
				width: 20px;
				height: 20px;
				margin-right: 8px;
				border-radius: 50%;
			}

			:host(.discord-embed) .discord-embed-footer .discord-footer-separator {
				color: #3b3c42;
				font-weight: 700;
				margin: 0 4px;
			}

			:host(.discord-light-theme):host(.discord-embed) .discord-embed-footer .discord-footer-separator {
				color: #e4e4e4;
			}

			:host(.discord-compact-mode):host(.discord-embed) {
				margin-left: 65px;
			}
		</style>
	`;

	this.classList.add('discord-embed');

	if (this.lightTheme)
		this.classList.add('discord-light-theme');

	if (this.compact)
		this.classList.add('discord-compact-mode');

	// <div class="discord-left-border">
	const embedColorDiv = document.createElement('div');
	{
		embedColorDiv.classList.add('discord-left-border');
		if (typeof this.color !== 'undefined')
			embedColorDiv.setAttribute('style', `background-color: ${this.color}`);
	}
	shadow.appendChild(embedColorDiv);
	// </div>

	// <div class="discord-embed-container">
	const embedContainerDiv = document.createElement('div');
	{
		embedContainerDiv.classList.add('discord-embed-container');

		// <div class="discord-embed-content">
		const embedContentDiv = document.createElement('div');
		{
			embedContentDiv.classList.add('discord-embed-content');

			// <div>
			const div = document.createElement('div')
			{
				// Add author info if at least author-name is provided
				if (typeof this.authorName !== 'undefined')
				{
					// <div class="discord-embed-author">
					const embedAuthorDiv = document.createElement('div')
					{
						embedAuthorDiv.classList.add('discord-embed-author');

						// Attach author image if provided
						if (typeof this.authorImage !== 'undefined')
						{
							// <img class="discord-author-image" />
							const authorImageImg = document.createElement('img');
							{
								authorImageImg.classList.add('discord-author-image');
								authorImageImg.src = this.authorImage;
							}
							embedAuthorDiv.appendChild(authorImageImg);
						}

						// Attach author name if provided
						if (typeof this.authorName !== 'undefined')
						{
							// Attach name with url if provided
							if (typeof this.authorUrl !== 'undefined')
							{
								// <a href="author-url" target="_blank">
								const authorUrlA = document.createElement('a');
								{
									authorUrlA.href = this.authorUrl;
									authorUrlA.target = '_blank';
									authorUrlA.innerText = this.authorName;
								}
								embedAuthorDiv.appendChild(authorUrlA);
								// </a>
							}
							// Otherwise just attach name
							else
							{
								// <span>
								const authorNameSpan = document.createElement('span');
								{
									authorNameSpan.innerText = this.authorName;
								}
								embedAuthorDiv.appendChild(authorNameSpan);
								// </span>
							}
						}
					}
					div.appendChild(embedAuthorDiv);
					// </div>
				}


				// Add title div if provided
				if (typeof this.title !== 'undefined')
				{
					// <div class="discord-embed-title">
					const embedTitleDiv = document.createElement('div');
					{
						embedTitleDiv.classList.add('discord-embed-title');

						if (typeof this.url !== 'undefined')
						{
							// <a href="url" target="_blank">
							const urlA = document.createElement('a');
							{
								urlA.href = this.url;
								urlA.target = '_blank';
								urlA.innerText = this.title;
							}
							embedTitleDiv.appendChild(urlA);
							// </a>
						}
						else
						{
							// <span>
							const embedTitleDivSpan = document.createElement('span');
							{
								embedTitleDivSpan.innerText = this.title;
							}
							embedTitleDiv.appendChild(embedTitleDivSpan);
							// </span>
						}
					}
					div.appendChild(embedTitleDiv);
					// </div>
				}
				// <div class="discord-embed-description">
				const embedDescriptionDiv = document.createElement('div')
				{
					embedDescriptionDiv.classList.add('discord-embed-description');

					// <slot>
					const slot = document.createElement('slot');
					embedDescriptionDiv.appendChild(slot);
					// </slot>
				}
				div.appendChild(embedDescriptionDiv);
				// </div>

				// <slot name="fields">
				const fieldsSlot = document.createElement('slot');
				{
					fieldsSlot.setAttribute('name', 'fields');
				}
				div.appendChild(fieldsSlot);
				// </slot>

				// Attach embed image if provided
				if (typeof this.image !== 'undefined')
				{
					// <img class="discord-embed-image">
					const embedImageImg = document.createElement('img');
					{
						embedImageImg.classList.add('discord-embed-image');
						embedImageImg.src = this.image;
					}
					div.appendChild(embedImageImg);
				}
			}
			embedContentDiv.appendChild(div);
			// </div>

			// Attach thumbnail if provided
			if (typeof this.thumbnail !== 'undefined')
			{
				// <img src="thumbnail" class="discord-embed-thumbnail">
				const thumbnailImg = document.createElement('img');
				{
					thumbnailImg.classList.add('discord-embed-thumbnail');
					thumbnailImg.src = this.thumbnail;
				}
				embedContentDiv.appendChild(thumbnailImg);
			}
		}
		embedContainerDiv.appendChild(embedContentDiv);
		// </div>

		// Show footer if we have a footer or a timestamp
		if (this.showFooter)
		{
			// <div class="discord-embed-footer">
			const embedFooterDiv = document.createElement('div');
			{
				embedFooterDiv.classList.add('discord-embed-footer');

				// Attach footer image if provided
				if (this.showFooterImage)
				{
					// <img src="footer-Image" class="discord-footer-image" />
					const footerImageImg = document.createElement('img');
					{
						footerImageImg.classList.add('discord-footer-image');
						footerImageImg.src = this.footerImage;
					}
					embedFooterDiv.appendChild(footerImageImg);
				}

				// <span>
				const footerSpan = document.createElement('span');
				{
					footerSpan.innerText = this.footerText;

					// Show footer separator if we have footer text and timestamp				
					if (this.showFooterSeparator)
					{
						// <span class="discord-footer-separator">
						const footerSeparatorSpan = document.createElement('span');
						{
							footerSeparatorSpan.classList.add('discord-footer-separator');
							footerSeparatorSpan.innerText = '•'
						}
						footerSpan.appendChild(footerSeparatorSpan);
						// </span>
					}

					// Show timestamp if provided
					if (typeof this.timestamp !== 'undefined')
					{
						// <span>
						const timestampSpan = document.createElement('span');
						{
							timestampSpan.innerText = this.timestamp;
						}
						footerSpan.appendChild(timestampSpan);
						// </span>
					}
				}
				embedFooterDiv.appendChild(footerSpan);
				// </span>
			}
			embedContainerDiv.appendChild(embedFooterDiv);
			// </div>
		}
	}
	shadow.appendChild(embedContainerDiv);
	// </div>
}