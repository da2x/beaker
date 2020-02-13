/* globals beaker */
import { html, css } from '../../../vendor/lit-element/lit-element.js'
import { BasePopup } from './base.js'
import popupsCSS from '../../../css/com/popups.css.js'
import { emit } from '../../lib/dom.js'
import * as toast from '../toast.js'
import * as uwg from '../../lib/uwg.js'
import { writeToClipboard } from '../../lib/clipboard.js'

// exported api
// =

export class AddUserPopup extends BasePopup {
  static get properties () {
    return {
      page: {type: Number},
      userUrl: {type: String},
      userId: {type: String},
      errors: {type: Object}
    }
  }

  static get styles () {
    return [popupsCSS, css`
    .popup-inner .body {
      padding: 0;
    }

    section {
      padding: 16px;
      border-bottom: 1px solid #dde;
    }

    h3 {
      margin-top: 0;
      font-weight: normal;
      letter-spacing: 1px;
    }

    h3 .step-number {
      position: relative;
      top: -1px;
      left: -1px;
      display: inline-block;
      color: #556;
      background: #f1f1f6;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      line-height: 20px;
      text-align: center;
      font-weight: 500;
      font-variant: tabular-nums;
      margin-right: 2px;
    }

    a.copy-btn {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      background: #f1f1f6;
      color: inherit;
      padding: 10px 20px;
      border-radius: 24px;
      box-sizing: border-box;
      color: #556;
      cursor: pointer;
    }

    a.copy-btn > :first-child {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 5px;
    }
    
    a.copy-btn:hover {
      background: #eaeaef;
    }

    img {
      display: block;
      margin: 0 auto;
      width: 390px;
      border-radius: 4px;
      box-shadow: 0 1px 2px #0003;
    }

    .instructions {
      margin: 14px 14px 0;
      color: #889;
      letter-spacing: 0.3px;
      font-weight: 300;
    }

    .long-error {
      display: flex;
      align-items: baseline;
      background: #fffafa;
      padding: 10px;
      border-radius: 4px;
      color: #d80b00;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }

    .long-error .fa-fw {
      margin-right: 8px;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      text-align: left;
    }
    `]
  }

  constructor () {
    super()
    this.page = 1
    this.userUrl = ''
    this.userId = ''
    this.errors = {}
  }


  // management
  //

  static async create (parentEl) {
    return BasePopup.coreCreate(parentEl, AddUserPopup)
  }

  static destroy () {
    return BasePopup.destroy('beaker-add-user-popup')
  }

  // rendering
  // =

  renderTitle () {
    return 'Add User'
  }

  renderBody () {
    return html`
      <form @submit=${this.onSubmit}>
        ${this.page === 1 ? html`
          <section>
            <h3><span class="step-number">1</span> Send this group's URL to your friend</h3>
            <div>
              <a class="copy-btn" @click=${this.onClickCopyDriveUrl}>
                <span>${location.origin}</span>
                <span class="fas fa-paste"></span>
              </a>
            </div>
          </section>

          <section>
            <h3><span class="step-number">2</span> Ask them to create a new profile</h3>
            <img src="/.ui/img/help-join-group.jpg">
            <div class="instructions">
              Tell them: "Visit the group and click <em>Join this Group.</em> It will help you create a profile."
            </div>
          </section>

          <section>
            <h3><span class="step-number">3</span> Ask them for their Profile URL</h3>
            <img src="/.ui/img/help-copy-profile-url.jpg">
            <div class="instructions">
              Tell them: "You should see a prompt to send me your URL. Copy it and send it over."
            </div>
          </section>

          <div class="form-actions">
            <button type="button" @click=${this.onClickCancel} class="btn cancel" tabindex="4">Cancel</button>
            <button type="button" @click=${this.onClickNext} class="btn primary" tabindex="5">Next</button>
          </div>
        ` : html`
          <section>
            <h3><span class="step-number">4</span> Enter their URL and ID</h3>

            <label for="userUrl">Profile URL</label>
            <input autofocus name="userUrl" tabindex="2" value=${this.userUrl || ''} placeholder="hyper://" @change=${this.onChangeUserUrl} class=${this.errors.userUrl ? 'has-error' : ''} />
            <div class="help">This is the URL of the profile which they generated.</div>
            ${this.errors.userUrl ? html`<div class="error">${this.errors.userUrl}</div>` : ''}

            ${this.errors.userDrive ? html`
              <div class="long-error">
                <span class="fas fa-fw fa-exclamation-triangle"></span>
                <span>${this.errors.userDrive}</span>
              </div>
            ` : ''}

            <label for="userId">User ID</label>
            <input name="userId" tabindex="3" placeholder="e.g. alice" @change=${this.onChangeUserId} class=${this.errors.userId ? 'has-error' : ''} value=${this.userId || ''}>
            <div class="help">This will be their ID in the group.</div>
            ${this.errors.userId ? html`<div class="error">${this.errors.userId}</div>` : ''}
          </section>

          <div class="form-actions">
            <button type="button" @click=${this.onClickBack} class="btn cancel" tabindex="4">Back</button>
            <button type="submit" class="btn primary" tabindex="5">Save</button>
          </div>
        `}
      </form>
    `
  }

  // events
  // =

  onClickCopyDriveUrl (e) {
    e.preventDefault()
    writeToClipboard(location.origin)
    toast.create('Copied to your clipboard')
  }

  onChangeUserUrl (e) {
    this.userUrl = e.target.value.trim()
  }

  onChangeUserId (e) {
    this.userId = e.target.value.trim()
  }

  onClickNext (e) {
    e.preventDefault()
    this.page = 2
  }

  onClickBack (e) {
    e.preventDefault()
    this.page = 1
  }

  onClickCancel (e) {
    e.preventDefault()
    emit(this, 'reject')
  }

  async onSubmit (e) {
    e.preventDefault()

    // validate
    this.errors = {}
    if (!this.userUrl) this.errors.userUrl = 'Required'
    if (!this.userId) this.errors.userId = 'Required'
    if (Object.keys(this.errors).length > 0) {
      return this.requestUpdate()
    }
    var userDriveValidation = await validateUserDrive(this.userUrl)
    if (!userDriveValidation.success) {
      this.errors.userDrive = userDriveValidation.message
      return this.requestUpdate()
    }

    try {
      await uwg.users.add(this.userUrl, this.userId)
      toast.create('User added', 'success')
      setTimeout(() => {window.location = `/${this.userId}`}, 1e3)
      emit(this, 'resolve')
    } catch (e) {
      console.log(e)
      toast.create(e.toString(), 'error')
    }
  }
}

customElements.define('beaker-add-user-popup', AddUserPopup)

async function validateUserDrive (url) {
  var urlp
  try {
    urlp = new URL(url)
  } catch (e) {
    return {success: false, message: 'This is not a valid URL. Make sure you input it correctly.'}
  }
  if (urlp.protocol !== 'hyper:') {
    return {success: false, message: `You must provide a "hyper:" URL. This is "${urlp.protocol}".`}
  }

  var drive = new Hyperdrive(url)
  var info
  try {
    info = await drive.readFile('/index.json').then(JSON.parse)
  } catch (e) {
    console.log('Failed to read manifest', e)
    return {success: false, message: 'This profile does not have a valid manifest (the index.json file). Ask your friend to make sure they sent the correct URL.'}
  }
  
  if (info.type !== 'user') {
    return {success: false, message: `This profile is not a "user" type (found "${info.type}"). Ask your friend to make sure they sent the correct URL.`}
  }

  var st = await drive.stat('/group').catch(e => undefined)
  var groupKey = st?.mount?.key
  if (groupKey !== location.hostname) {
    return {success: false, message: `This profile was not created for this group. Ask your friend to make sure they sent the correct URL and that they joined the correct group.`}
  }

  return {success: true}
}