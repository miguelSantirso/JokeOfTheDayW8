require 'json'

lang_folders = FileList.new('strings/*');

lang_folders.each do |lang_folder|
	orig_jokes_file = File.join(lang_folder, "jokes.txt")
	target_jokes_file = File.join(lang_folder, "jokes.resjson")
	
	if File.exists?(orig_jokes_file)
		
		file target_jokes_file => [orig_jokes_file] do
			plain_to_resjson(orig_jokes_file, target_jokes_file)
		end
		
		task :rebuild_jokes => [target_jokes_file]
	end
end

desc "Rebuilds all jokes to .json"
task :rebuild_jokes 


private


def plain_to_resjson(original, target)
	original = File.new(original, "r:UTF-8")

	
	jsonJokes = {}
	nJoke = 0
	original.each do |joke|
		stripped_joke = joke.strip
		if !stripped_joke.empty?
			jsonJokes["joke#{nJoke}"] = stripped_joke
			nJoke = nJoke + 1
		end
	end
	
	jsonJokes["nJokes"] = nJoke.to_s
	
	target = File.new(target, "w+")
	target.write(JSON.pretty_generate(jsonJokes))
	target.close
	
	original.close
end