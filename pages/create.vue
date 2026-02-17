<template>
  <div class="post-composer">
    <h2>Create New Post</h2>
    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Post Content -->
      <div class="form-group">
        <label for="post-content" class="label-required">Post Content</label>
        <textarea
          id="post-content"
          v-model="postContent"
          placeholder="What's on your mind?"
          required
          aria-required="true"
          aria-describedby="char-count content-help"></textarea>
        <div
          id="char-count"
          :class="['char-counter', charCountClass]"
          role="status"
          aria-live="polite">
          <span>{{ charCount }} characters</span>
          <span v-if="selectedPlatforms.length > 0">
            Longest limit: {{ maxCharLimit }}
          </span>
        </div>
        <div v-if="charWarning" class="char-warning" role="alert">
          ⚠️ {{ charWarning }}
        </div>
        <p id="content-help" class="sr-only">
          Enter the content you want to post across your selected social media platforms
        </p>
      </div>

      <!-- Platform Selection -->
      <div class="form-group">
        <fieldset class="socials">
          <legend id="platforms-label" class="label-required">
            Select Platforms
          </legend>
          <div class="platforms-grid" role="group" aria-labelledby="platforms-label">
            <button
              v-for="platform in availablePlatforms"
              :key="platform.id"
              type="button"
              class="platform-button"
              :class="{ 'platform-selected': selectedPlatforms.includes(platform.id) }"
              @click="togglePlatform(platform.id)"
              :aria-pressed="selectedPlatforms.includes(platform.id)">
              <span class="platform-icon" v-html="platform.icon"></span>
              <span class="platform-name">{{ platform.name }}</span>
              <span v-if="selectedPlatforms.includes(platform.id)" class="platform-check">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                </svg>
              </span>
            </button>
          </div>
        </fieldset>
        <p v-if="formSubmitted && selectedPlatforms.length === 0" class="alert alert-error"
          role="alert">
          Please select at least one platform
        </p>
      </div>

      <!-- Tags Input -->
      <div class="form-group">
        <label for="tag-input">Tags (optional)</label>
        <div class="tags-input-wrapper">
          <div class="tags-container" @click="focusTagInput">
            <span
              v-for="(tag, index) in tags"
              :key="index"
              class="tag"
              role="listitem">
              {{ tag }}
              <button
                type="button"
                class="tag-remove"
                @click="removeTag(index)"
                :aria-label="`Remove tag ${tag}`">
                ✕
              </button>
            </span>
            <input
              id="tag-input"
              ref="tagInputRef"
              v-model="currentTag"
              type="text"
              class="tag-input"
              placeholder="Add tags..."
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
              @keydown.space.prevent="addTag"
              aria-describedby="tag-help" />
          </div>
          <p id="tag-help" class="sr-only">
            Press Enter, Space, or Comma to add a tag. Tags will be formatted according to each
            platform's requirements.
          </p>
          <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
            Press Enter, Space, or Comma to add tags
          </p>
        </div>
      </div>

      <!-- Image Upload -->
      <div class="form-group">
        <label for="image-upload">Images (optional)</label>

        <!-- Compact toggle section -->
        <div class="image-upload-controls">
          <button
            type="button"
            class="btn btn-outline"
            @click="triggerImageUpload"
            :disabled="images.length >= 4">
            📷 Add Images ({{ images.length }}/4)
          </button>

          <div class="alt-text-toggle">
            <label class="toggle-switch">
              <input
                id="require-alt-text"
                v-model="requireAltText"
                type="checkbox"
                @change="saveAltTextPreference" />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">Enable alt text</span>
          </div>
        </div>

        <p class="help-text">
          Maximum 4 images. {{ requireAltText ? 'Alt text is optional but recommended for accessibility.' : 'Alt text is optional but recommended for accessibility.' }}
        </p>

        <input
          id="image-upload"
          ref="imageInputRef"
          type="file"
          accept="image/*"
          multiple
          @change="handleImageUpload"
          style="display: none;" />

        <!-- Image Previews -->
        <div v-if="images.length > 0" class="image-previews">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="image-preview-item">
            <img :src="image.preview" :alt="image.alt_text || 'Image preview'"
              class="preview-image" />
            <div class="image-details">
              <label :for="`alt-text-${index}`" :class="{ 'label-required': requireAltText }">
                Alt Text {{ requireAltText ? '(Required)' : '(Optional)' }}
              </label>
              <input
                :id="`alt-text-${index}`"
                v-model="image.alt_text"
                type="text"
                placeholder="Describe this image for accessibility"
                :required="requireAltText"
                @input="validateImages"
                :aria-invalid="formSubmitted && requireAltText && !image.alt_text ? 'true' : 'false'" />
              <button
                type="button"
                class="btn btn-outline btn-sm"
                @click="removeImage(index)">
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-if="formSubmitted && requireAltText && hasImagesWithoutAltText"
          class="alert alert-error"
          role="alert">
          All images should have alt text for accessibility
        </p>
      </div>

      <!-- Post Scheduling (Creator+ plans only) -->
      <div v-if="canSchedulePosts" class="form-group">
        <div class="scheduling-header">
          <label for="schedule-toggle">Schedule Post</label>
          <label class="toggle-switch">
            <input
              id="schedule-toggle"
              v-model="schedulePost"
              type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div v-if="schedulePost" class="scheduling-controls">
          <div class="form-group">
            <label for="schedule-date" class="label-required">Date & Time</label>
            <input
              id="schedule-date"
              v-model="scheduledDateTime"
              type="datetime-local"
              :min="minScheduleDateTime"
              required
              aria-required="true" />
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
              Your timezone: {{ userTimezone }}
            </p>
          </div>
        </div>
      </div>
      <div v-else-if="selectedPlatforms.length > 0" class="upgrade-notice">
        <p>
          📅 <strong>Want to schedule posts? </strong>
          <NuxtLink to="/pricing">Upgrade to Creator</NuxtLink> to schedule posts for later.
        </p>
      </div>

      <!-- Preview Section -->
      <section
        v-if="selectedPlatforms.length > 0"
        class="preview-card"
        aria-labelledby="preview-heading">
        <h3 id="preview-heading">Platform Previews</h3>
        <div
          v-for="platformId in selectedPlatforms"
          :key="platformId"
          style="margin-bottom: 1.5rem;">
          <h4>{{ getPlatformById(platformId)?.name }}</h4>
          <div class="preview-content" role="region"
            :aria-label="`Preview for ${getPlatformById(platformId)?.name}`">
            {{ formatPostForPlatform(platformId) }}
          </div>
        </div>
      </section>

      <!-- Status Messages -->
      <div v-if="statusMessage" :class="['alert', `alert-${statusMessage.type}`]" role="alert">
        {{ statusMessage.text }}
      </div>

      <!-- Action Buttons -->
      <div class="btn-group">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting || charCount > 300">
          <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
          {{ isSubmitting ? 'Posting...' : 'Post to Platforms' }}
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          @click="saveDraft"
          :disabled="isSubmitting">
          Save Draft
        </button>

        <button
          type="button"
          class="btn btn-outline"
          @click="clearForm"
          :disabled="isSubmitting">
          Clear
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const user = useSupabaseUser()
const router = useRouter()
const supabase = useSupabaseClient()
const draftId = ref<string | null>(null)

// Load user profile for subscription check
const userProfile = ref<any>(null)
onMounted(async () => {
  // Load alt text preference from localStorage
  const savedPreference = localStorage.getItem('requireAltText')
  if (savedPreference !== null) {
    requireAltText.value = savedPreference === 'true'
  }

  // Load draft from sessionStorage (coming from drafts page)
  const loadDraftData = sessionStorage.getItem('loadDraft')

  if (loadDraftData) {
    try {
      const draft = JSON.parse(loadDraftData)

      // Store the draft ID so we update instead of creating new
      draftId.value = draft.id

      postContent.value = draft.content || ''
      selectedPlatforms.value = draft.platforms || []
      tags.value = draft.tags || []

      if (draft.scheduled_for) {
        schedulePost.value = true
        scheduledDateTime.value = new Date(draft.scheduled_for).toISOString().slice(0, 16)
      }

      sessionStorage.removeItem('loadDraft')

      // Show persistent message about images if draft had images
      const hasImages = draft.images && draft.images.length > 0
      if (hasImages) {
        statusMessage.value = {
          type: 'info',
          text: `Draft loaded. Please re-add ${draft.images.length} image(s) before posting.`
        }
        // Don't auto-dismiss - will be cleared when images are added
      } else {
        statusMessage.value = {
          type: 'info',
          text: 'Draft loaded successfully'
        }
        setTimeout(() => {
          statusMessage.value = null
        }, 3000)
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  // Load user profile for subscription check
  if (user.value) {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.value.id)
      .single()

    if (data) {
      userProfile.value = data
    }
  }
})

// Check if user can schedule posts (Creator+ plans)
const canSchedulePosts = computed(() => {
  return userProfile.value && ['creator', 'professional', 'enterprise'].includes(userProfile.value.subscription_tier)
})

// Scheduling state
const schedulePost = ref(false)
const scheduledDateTime = ref('')
const userTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
const minScheduleDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
  return now.toISOString().slice(0, 16)
})

// Types
interface Platform {
  id: string
  name: string
  icon: string
  charLimit: number
  tagFormat: string
  hashtagSymbol: string
}

interface StatusMessage {
  type: 'success' | 'error' | 'info'
  text: string
}

interface PostResult {
  success: boolean
  message?: string
}

interface PostResponse {
  success: boolean
  scheduled?: boolean
  scheduled_for?: string
  post_id?: string
  message?: string
  results?: Record<string, PostResult>
  timestamp?: string
}

// Available platforms with icons
const availablePlatforms = ref<Platform[]>([
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
    </svg>`,
    charLimit: 300,
    tagFormat: 'Hashtags (#tag)',
    hashtagSymbol: '#'
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
    </svg>`,
    charLimit: 500,
    tagFormat: 'Hashtags (#tag)',
    hashtagSymbol: '#'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`,
    charLimit: 3000,
    tagFormat: 'Hashtags (#tag)',
    hashtagSymbol: '#'
  }
])

// Platform configurations (for backwards compatibility with existing code)
const platforms = availablePlatforms

// Toggle platform selection
const togglePlatform = (platformId: string) => {
  const index = selectedPlatforms.value.indexOf(platformId)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platformId)
  }
}

// Form state
const postContent = ref('')
const selectedPlatforms = ref<string[]>([])
const tags = ref<string[]>([])
const currentTag = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const images = ref<Array<{ file: File; preview: string; alt_text: string; uploaded_url?: string }>>([])
const isSubmitting = ref(false)
const formSubmitted = ref(false)
const statusMessage = ref<StatusMessage | null>(null)
const requireAltText = ref(true)

// Character counting
const charCount = computed(() => postContent.value.length)
const charCountClass = computed(() => {
  if (charCount.value > 300) return 'char-counter-error'
  if (charCount.value > 280) return 'char-counter-warning'
  return ''
})

// Add warning message
const charWarning = computed(() => {
  if (charCount.value > 300) {
    return 'Post exceeds Bluesky limit (300 chars). It will fail on Bluesky.'
  }
  return ''
})

const maxCharLimit = computed(() => {
  if (selectedPlatforms.value.length === 0) return 0

  // Platform character limits
  const limits: Record<string, number> = {
    bluesky: 300,
    mastodon: 500,
    linkedin: 3000
  }

  // Find the minimum limit among selected platforms (most restrictive)
  const selectedLimits = selectedPlatforms.value
    .map(id => {
      const platform = platforms.value.find(p => p.id === id)
      return platform ? limits[platform.id] || 500 : 500
    })

  return Math.min(...selectedLimits)
})

// Methods
const clearForm = () => {
  postContent.value = ''
  selectedPlatforms.value = []
  tags.value = []
  currentTag.value = ''
  images.value = []
  schedulePost.value = false
  scheduledDateTime.value = ''
  formSubmitted.value = false
  statusMessage.value = null
  draftId.value = null  // Clear draft ID
}

const getPlatformById = (id: string) => {
  return platforms.value.find(p => p.id === id)
}

const saveAltTextPreference = () => {
  localStorage.setItem('requireAltText', requireAltText.value.toString())
}

const formatPostForPlatform = (platformId: string) => {
  const platform = getPlatformById(platformId)
  if (!platform) return postContent.value

  let formattedPost = postContent.value

  // Add tags if any
  if (tags.value.length > 0) {
    const formattedTags = tags.value
      .map(tag => {
        // Remove any existing # symbols
        const cleanTag = tag.replace(/^#/, '')
        return `${platform.hashtagSymbol}${cleanTag}`
      })
      .join(' ')

    formattedPost = `${formattedPost}\n\n${formattedTags}`
  }

  return formattedPost
}

const addTag = () => {
  const tag = currentTag.value.trim()

  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    currentTag.value = ''
  }
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

const focusTagInput = () => {
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

// Image upload methods
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files) return

  // Limit to 4 images total
  const remainingSlots = 4 - images.value.length
  const filesToAdd = Array.from(files).slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      statusMessage.value = {
        type: 'error',
        text: 'Only image files are allowed'
      }
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      statusMessage.value = {
        type: 'error',
        text: 'Image must be smaller than 5MB'
      }
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push({
        file: file,
        preview: e.target?.result as string,
        alt_text: ''
      })

      // Clear the persistent image warning message if it's showing
      if (statusMessage.value?.type === 'info' && statusMessage.value?.text.includes('re-add')) {
        statusMessage.value = null
      }
    }
    reader.readAsDataURL(file)
  })

  // Reset input
  input.value = ''
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

const validateImages = () => {
  // Check if all images have alt text
  return images.value.every(img => img.alt_text.trim().length > 0)
}

const hasImagesWithoutAltText = computed(() => {
  return images.value.length > 0 && !validateImages()
})

const handleSubmit = async () => {
  formSubmitted.value = true

  // Validation
  if (!postContent.value.trim()) {
    statusMessage.value = {
      type: 'error',
      text: 'Please enter post content'
    }
    return
  }

  if (selectedPlatforms.value.length === 0) {
    statusMessage.value = {
      type: 'error',
      text: 'Please select at least one platform'
    }
    return
  }

  if (charCount.value > maxCharLimit.value) {
    statusMessage.value = {
      type: 'error',
      text: `Post content exceeds the ${maxCharLimit.value} character limit`
    }
    return
  }

  // Validate images have alt text (only if required)
  if (requireAltText.value && images.value.length > 0 && !validateImages()) {
    statusMessage.value = {
      type: 'error',
      text: 'All images must have alt text for accessibility'
    }
    return
  }

  isSubmitting.value = true
  statusMessage.value = null

  try {
    // Upload images first if any
    const uploadedImages: Array<{ url: string; alt_text: string; file_name: string }> = []

    if (images.value.length > 0) {
      statusMessage.value = {
        type: 'info',
        text: 'Uploading images...'
      }

      for (const image of images.value) {
        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('alt_text', image.alt_text)

        type UploadResponse = {
          success: boolean
          url: string
          message?: string
        }

        const uploadResponse = await $fetch<UploadResponse>('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        uploadedImages.push({
          url: uploadResponse.url,
          alt_text: image.alt_text,
          file_name: image.file.name
        })
      }
    }

    statusMessage.value = {
      type: 'info',
      text: schedulePost.value ? 'Scheduling post...' : 'Posting to platforms...'
    }

    // Call the real posting API
    const response = await $fetch<PostResponse>('/api/post', {
      method: 'POST',
      body: {
        content: postContent.value,
        platforms: selectedPlatforms.value,
        tags: tags.value,
        images: uploadedImages,
        scheduled_for: schedulePost.value && scheduledDateTime.value ? new Date(scheduledDateTime.value).toISOString() : null
      }
    })

    // Check if scheduled
    if (response.scheduled) {
      statusMessage.value = {
        type: 'success',
        text: `Post scheduled successfully for ${new Date(response.scheduled_for!).toLocaleString()}!`
      }
      clearForm()
      return
    }

    // Check results
    const successPlatforms = response.results
      ? Object.entries(response.results)
        .filter(([_, result]) => (result as PostResult).success)
        .map(([platform]) => platform)
      : []

    const failedPlatforms = response.results
      ? Object.entries(response.results)
        .filter(([_, result]) => !(result as PostResult).success)
        .map(([platform, result]) => ({
          platform,
          error: (result as PostResult).message || 'Unknown error'
        }))
      : []

    if (successPlatforms.length > 0) {
      statusMessage.value = {
        type: 'success',
        text: `Successfully posted to ${successPlatforms.length} platform(s)!`
      }

      // Show failures if any
      if (failedPlatforms.length > 0) {
        setTimeout(() => {
          statusMessage.value = {
            type: 'error',
            text: `Failed to post to: ${failedPlatforms.map(f => f.platform).join(', ')}`
          }
        }, 3000)
      }

      // Clear form after successful post
      setTimeout(() => {
        clearForm()
      }, 2000)
    } else {
      // All failed
      statusMessage.value = {
        type: 'error',
        text: 'Failed to post to all platforms. Please check your connections.'
      }
    }

  } catch (error: any) {
    console.error('Post error:', error)

    // Handle specific error cases
    if (error.statusCode === 401) {
      statusMessage.value = {
        type: 'error',
        text: 'Please log in to continue'
      }
    } else if (error.statusCode === 403) {
      statusMessage.value = {
        type: 'error',
        text: error.data?.message || 'Post limit reached. Please upgrade your plan.'
      }
    } else if (error.statusCode === 400 && error.data?.message?.includes('No connected platforms')) {
      statusMessage.value = {
        type: 'error',
        text: 'Please connect your social media accounts first'
      }
    } else {
      statusMessage.value = {
        type: 'error',
        text: error.data?.message || 'Failed to post. Please try again.'
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  if (!postContent.value.trim()) {
    statusMessage.value = {
      type: 'error',
      text: 'Cannot save empty draft'
    }
    return
  }

  try {
    // Prepare images data (only save metadata, not file objects)
    const imageData = images.value.map(img => ({
      url: img.uploaded_url || img.preview,
      alt_text: img.alt_text,
      file_name: img.file ? img.file.name : ''
    }))

    const draftData = {
      user_id: user.value!.id,
      content: postContent.value,
      platforms: selectedPlatforms.value,
      tags: tags.value,
      images: imageData,
      scheduled_for: schedulePost.value && scheduledDateTime.value
        ? new Date(scheduledDateTime.value).toISOString()
        : null
    }

    // If we have a draftId, update existing draft. Otherwise create new one.
    if (draftId.value) {
      const { error } = await (supabase as any)
        .from('drafts')
        .update(draftData)
        .eq('id', draftId.value)

      if (error) throw error
    } else {
      const { data, error } = await (supabase as any)
        .from('drafts')
        .insert(draftData)
        .select()
        .single()

      if (error) throw error
      if (data) {
        draftId.value = data.id
      }
    }

    statusMessage.value = {
      type: 'success',
      text: draftId.value ? 'Draft updated successfully!' : 'Draft saved successfully!'
    }

    setTimeout(() => {
      statusMessage.value = null
    }, 3000)

  } catch (error: any) {
    statusMessage.value = {
      type: 'error',
      text: error.message || 'Failed to save draft'
    }
  }
}

// SEO
useHead({
  title: 'Create Post - Broadcast',
  meta: [
    { name: 'description', content: 'Create and post to multiple social media platforms simultaneously' }
  ]
})
</script>

<style scoped>
.char-counter-warning {
  color: var(--color-warning, #f59e0b);
}

.char-counter-error {
  color: var(--color-error, #ef4444);
  font-weight: bold;
}

.char-warning {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  color: #92400e;
  font-size: 0.875rem;
}

/* Image upload controls - tight compact layout */
.image-upload-controls {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-sm);
}

.alt-text-toggle {
  display: flex;
  gap: var(--space-md);
  margin-top: auto;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked+.toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.toggle-switch input:checked+.toggle-slider:before {
  transform: translateX(20px);
}

.toggle-switch input:focus+.toggle-slider {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.toggle-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  user-select: none;
  white-space: nowrap;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .image-upload-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .alt-text-toggle {
    justify-content: flex-start;
  }
}
</style>
