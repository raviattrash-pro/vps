package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Poll;
import com.visionpublicschool.repository.PollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/polls")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class PollController {

    @Autowired
    private PollRepository pollRepository;

    @GetMapping
    public List<Poll> getActivePolls() {
        return pollRepository.findByIsActiveTrue();
    }

    @PostMapping
    public Poll createPoll(@RequestBody Poll poll) {
        poll.setActive(true);
        // Initialize votes map
        Map<String, Integer> votes = new HashMap<>();
        for (String opt : poll.getOptions()) {
            votes.put(opt, 0);
        }
        poll.setVotes(votes);
        return pollRepository.save(poll);
    }

    @PostMapping("/{id}/vote")
    public Poll vote(@PathVariable Long id, @RequestParam String option) {
        Poll poll = pollRepository.findById(id).orElseThrow();
        Map<String, Integer> votes = poll.getVotes();
        if (votes.containsKey(option)) {
            votes.put(option, votes.get(option) + 1);
        }
        poll.setVotes(votes);
        return pollRepository.save(poll);
    }
}
