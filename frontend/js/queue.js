/* Todo:
- Modularize loadQueue()!!!
- Define 'pressed' styling class for vote buttons that have been pressed
- Account for multiple artists returned
- Display cover art (will receive url of image, so will need to render from the url)
- Display the vote counts on each queue item
- Make it so that only track metadata is shown on each queue item initially, then when the item is clicked,
  either the item is pushed up or the items below it are pushed down, and then the vote buttons are displayed.
  I'm not sure if it would be better to have the vote numbers here or not too. If the track was requested by the current user,
  then don't allow this mini menu to open up on that queue item.
- Make it so the text for each queue item scrolls back and forth if it is too long to fit into the area
*/

// URL for fetching the queue data
queueUrl = '../public/data/tracks.sample.json';

// URL for fetching the vote data
voteUrl = '../api/vote';

// Id of the user currently loading the queue or sending the vote
currentUserId = 0;

// Will contain the list of queue items
const container = document.getElementById('queue-container');

// Will be displayed if the queue is empty
const emptyMessage = document.getElementById('queue-empty');

async function loadQueue() {
    try {
        const res = await fetch(queueUrl);                          // Send a GET request to /api/queue endpoint
        if (!res.ok) throw new Error('Failed to fetch queue');      // If response has an HTTP status code not in 200 range, then throw error
        const queueItems = await res.json();                        // Convert response to json

        container.innerHTML = '';                                   // Initially set queue to empty

        if (!queueItems || queueItems.length === 0) {               // If there are no queue items
            emptyMessage.classList.remove('d-none');                // Then display the 'empty' message
            return;
        }

        emptyMessage.classList.add('d-none');                       // Ensure the 'empty' message is hidden

        queueItems.forEach(queueItem => {
            const queueCard = document.createElement('div');
            queueCard.className = 'list-group-item d-flex justify-content-between align-items-center';
            queueCard.innerHTML = `
                <div>
                    <strong>${queueItem.title || 'Unknown Title'}</strong>
                    <div class="text-muted small">${queueItem.artist || 'Unknown Artist'}</div>
                    <div class="text-muted small">${queueItem.releaseName || 'Unknown Release'}</div>
                </div>
                <div>
                    <button class="upvote btn btn-sm btn-outline-success me-2">▲</button>
                    <button class="downvote btn btn-sm btn-outline-danger">▼</button>
                </div>
            `;                                                      // Inside queue item is metadata separated from vote buttons

            if (queueItem.willBeSkipped) {
                queueCard.classList.add('opacity-50');              // Reduce opacity of queue items that will be skipped
            }

            const upButton = queueCard.querySelector('.upvote');    // Get upvote and downvote buttons
            const downButton = queueCard.querySelector('.downvote');

            if (queueItem.userId === currentUserId) {               // If a queue item was requested by the current user, hide the vote buttons
                upButton.classList.add('d-none');
                downButton.classList.add('d-none');
            }

            if (queueItem.myVote === 'up') {                        // If user has already pressed the vote button previously, then mark as pressed
                upButton.classList.add('pressed');
            }
            if (queueItem.myVote === 'down') {
                downButton.classList.add('pressed');
            }

            upButton.addEventListener('click', () => {              // Attach click listeners to vote buttons
                sendVote(queueItem.id, true);                       // Send the vote with the queue item's id and vote type
                upButton.classList.add('pressed');                  // Give immediate feedback to the user
                downButton.classList.remove('pressed');
            });
            downButton.addEventListener('click', () => {
                sendVote(queueItem.id, false)
                downButton.classList.add('pressed');
                upButton.classList.remove('pressed');
            });

            container.appendChild(queueCard);                       // Append queue item to queue container
        });
    } catch (err) {
        console.error(err);
        emptyMessage.textContent = "Error loading queue.";          // Set the 'empty' message to display error feedback
        emptyMessage.classList.remove('d-none');                    // Display the message
    }
}

async function sendVote(queueItemId, isUpvote) {
    try {
        // Send a POST request to /api/vote endpoint
        const res = await fetch(voteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, queueItemId, isUpvote })
        });
        // If response has an HTTP response code not in 200 range, throw an error
        if (!res.ok) {
            console.error('Vote failed');
            return;
        }

        // For now: Reload queue from server
        loadQueue();

        // Later: Update DOM without full reload (through a realtime websockets update)

    } catch (err) {
        console.error('Vote error:', err);
    }
}

// Upon loading the document, load the queue
document.addEventListener('DOMContentLoaded', () => {
    loadQueue();
});