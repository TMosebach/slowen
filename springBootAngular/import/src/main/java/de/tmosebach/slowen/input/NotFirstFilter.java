package de.tmosebach.slowen.input;

public class NotFirstFilter {
	private boolean isFirst = true;
	
	public boolean notFirst(String line) {
		if (isFirst ) {
			isFirst = false;
			return false;
		}
		return true;
	}
}