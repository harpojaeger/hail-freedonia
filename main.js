$(document).ready( () => {
  const nav = $('ul.nav')
  const candidateMeta = $('div.candidate-meta')
  const votingControls = $('div.voting-controls')
  const voteCTA = $('div.vote-cta')
  const voteConfirmationText = $('div.vote-confirmation-text')
  const voteConfirmationCandidateName = $('span.vote-confirmation-candidate-name')
  const voteButton = $('button.vote-button')
  var bios = []
  var tabs = []

  $(votingControls).on('selectedCandidateUpdated', function(){
    console.log($(this).data())
    let selectedCandidate = $(this).data().selectedCandidate
    $(voteButton)
    .text('Vote for ' + selectedCandidate)
    // need to use display: block so the margins work
    .css('display', 'block')
    $(voteCTA).show();
    $(voteConfirmationText).hide()
  })
  .on('confirmCandidate', function() {
    console.log('confirming')
    let candidateName = $(this).data().selectedCandidate
    $(voteConfirmationCandidateName).text(candidateName)
    $(voteCTA).hide()
    $(voteConfirmationText).show()
    $(voteButton).text('Yes, I want to vote for ' + candidateName)
    $(this).data('nextAction', 'castVote')
  })
  .on('castVote', function() {
    console.log('voting')
    $(this).trigger('voteProcessed')
  })
  .on('voteProcessed', function () {
    console.log('voted')
    // Hide
    $(votingControls).fadeOut()
    // Freeze the nav
    $(tabs).each(function() {
      $(this)
      .unbind('click')
      .css({cursor: 'auto'})
    })
    // Freeze the selected candidate in color
    $('li.selected-candidate').css({
      'background-color': '#006700',
      'color' : 'white'
    })
    // easter egg!
    .dblclick( () => {
      window.location.href="https://www.youtube.com/watch?v=wiUlDEw9yLY"
    })
    // Replace the candidate description with a confirmation message.
    $(candidateMeta).fadeOut(400, function(){
      $(this)
      .text('Thank you! Your vote has been recorded.')
      .show()
    })
  })

  $(voteButton).click( () => {
    let data = $(votingControls).data()
    console.log(data)
    // run the next action (confirmCandidate or castVote)
    $(votingControls).trigger(data.nextAction)
  })

  $.ajax("candidates.csv", {dataType: "text"})
  .done( (data) => {
    // JSONify the candidate data and sort by last name
    const candidates = $.csv.toObjects(data).sort( (a,b) => {
      if(a.last_name.toUpperCase() < b.last_name.toUpperCase()) return -1
      if(a.last_name.toUpperCase() > b.last_name.toUpperCase()) return 1
      return 0
    })
    $.each(candidates, (i, candidate) => {
      let fullName = candidate.first_name + ' ' + candidate.last_name
      const a = $('<a href="javascript:;">').text(fullName)
      const party = $('<div>')
      .addClass('candidate-party')
      .text('Party: ' + candidate.party)

      const district = $('<div>')
      .addClass('candidate-district')
      .text('District: ' + candidate.electoral_district)

      const bio = $('<div>')
      .addClass('candidate-meta')
      .hide()
      .text(candidate.bio)
      .prepend(district)
      .prepend(party)
      .attr('role', 'tabpanel')
      .appendTo(candidateMeta)

      bios.push(bio)

      const li = $('<li>')
      .addClass('candidate')
      // add some ARIA attrs
      .attr({
        'role': 'tab',
        'aria-selected': 'false',
        // need to add aria-controls in here once refactoring is complete
      })
      .click(function() {
        // toggle bio visibility
        $.each(bios, function() {
          $(this).hide()
        })
        $(bio).show()

        // manage the unselected <li>s
        $.each(tabs, function() {
          $(this)
          .removeClass('selected-candidate')
          .attr('aria-selected','false')
        })

        // select this <li>
        $(this)
        .addClass('selected-candidate')
        .attr('aria-selected', 'true')
        $(votingControls)
        .data({
          selectedCandidate: fullName,
          nextAction: 'confirmCandidate',
        })
        .trigger('selectedCandidateUpdated')
      })
      .append(a)
      $(li).appendTo(nav)
      tabs.push(li)
    })
  })
})
